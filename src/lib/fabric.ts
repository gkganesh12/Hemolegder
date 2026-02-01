/**
 * Fabric Service with Mock Blockchain Fallback
 *
 * Attempts to connect to real Hyperledger Fabric.
 * Falls back to PostgreSQL-based mock blockchain for development.
 */

import * as path from 'path';
import * as fs from 'fs';
import crypto from 'crypto';
import { prisma } from './prisma';

const CONNECTION_PROFILE_PATH = path.resolve(
  process.cwd(),
  'fabric/connection-profiles/bloodbank-org.json'
);

const WALLET_PATH = path.resolve(process.cwd(), 'fabric/wallets');

// Mode: 'fabric' | 'mock'
let mode: 'fabric' | 'mock' = 'mock';

// Dynamic import to avoid build-time issues
async function getFabricNetwork() {
  try {
    const { Gateway, Wallets } = await import('fabric-network');
    return { Gateway, Wallets };
  } catch (error) {
    console.warn('[Fabric] fabric-network module not available');
    throw error;
  }
}

export interface BloodUnitData {
  unitId: string;
  unitCode: string;
  bloodGroup: string;
  organizationId: string;
  dataHash: string;
  timestamp: string;
}

export interface StatusUpdateData {
  unitId: string;
  status: string;
  updatedBy: string;
  timestamp: string;
}

export interface TestStatusData {
  unitId: string;
  testType: string;
  resultHash: string;
  status: string;
  timestamp: string;
}

export interface TransferData {
  unitId: string;
  fromOrgId: string;
  toOrgId: string;
  transferredBy: string;
  timestamp: string;
}

export interface ConsentData {
  donorId: string;
  consentType: string;
  grantedTo: string;
  status: string;
  timestamp: string;
}

interface BloodUnitOnChain {
  unitId: string;
  unitCode: string;
  bloodGroup: string;
  status: string;
  owner: string;
  dataHash: string;
  createdTime: string;
  lastUpdatedTime: string;
  testHashes: Array<{
    testType: string;
    resultHash: string;
    status: string;
    timestamp: string;
  }>;
  transfers: Array<{
    from: string;
    to: string;
    transferredBy: string;
    timestamp: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let gateway: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let contract: any = null;

// Helper functions for mock mode
function generateTxId(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function getNextBlockNumber(): Promise<number> {
  const latest = await prisma.blockchainLedger.findFirst({
    orderBy: { blockNumber: 'desc' },
  });
  return (latest?.blockNumber || 0) + 1;
}

async function getState(key: string): Promise<string | null> {
  const latest = await prisma.blockchainLedger.findFirst({
    where: { key },
    orderBy: { blockNumber: 'desc' },
  });
  return latest?.value || null;
}

async function putState(
  txId: string,
  key: string,
  value: string,
  eventName?: string,
  eventPayload?: string
): Promise<void> {
  await prisma.blockchainLedger.create({
    data: {
      txId,
      key,
      value,
      blockNumber: await getNextBlockNumber(),
      timestamp: new Date(),
      eventName,
      eventPayload,
    },
  });
}

// Real Fabric functions
async function getGateway(identity: string = 'admin') {
  if (gateway) {
    return gateway;
  }

  if (!fs.existsSync(CONNECTION_PROFILE_PATH)) {
    throw new Error('Fabric connection profile not found');
  }

  const { Gateway, Wallets } = await getFabricNetwork();
  const connectionProfile = JSON.parse(fs.readFileSync(CONNECTION_PROFILE_PATH, 'utf8'));
  const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

  gateway = new Gateway();
  await gateway.connect(connectionProfile, {
    wallet,
    identity,
    discovery: { enabled: true, asLocalhost: true },
  });

  return gateway;
}

async function getContract() {
  if (contract) {
    return contract;
  }

  const gw = await getGateway();
  const network = await gw.getNetwork(process.env.FABRIC_CHANNEL_NAME || 'bloodchannel');
  contract = network.getContract(process.env.FABRIC_CHAINCODE_NAME || 'bloodbank');

  return contract;
}

export const fabricService = {
  /**
   * Get current mode
   */
  getMode(): 'fabric' | 'mock' {
    return mode;
  },

  /**
   * Check if fabric network is available and set mode
   */
  async initialize(): Promise<void> {
    // Check for mock mode override
    if (process.env.FABRIC_MODE === 'mock') {
      mode = 'mock';
      console.log('[Fabric] Running in MOCK mode (environment override)');
      return;
    }

    // Try to connect to real Fabric
    if (fs.existsSync(CONNECTION_PROFILE_PATH)) {
      try {
        await getContract();
        mode = 'fabric';
        console.log('[Fabric] Connected to Hyperledger Fabric network');
        return;
      } catch (error) {
        console.warn('[Fabric] Failed to connect to Fabric network:', error);
      }
    }

    // Fall back to mock mode
    mode = 'mock';
    console.log('[Fabric] Running in MOCK mode (PostgreSQL-based blockchain simulation)');
  },

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return true; // Always available (either Fabric or mock)
  },

  /**
   * Register a new blood unit on the blockchain
   */
  async registerBloodUnit(data: BloodUnitData): Promise<string> {
    if (mode === 'fabric') {
      try {
        const c = await getContract();
        const result = await c.submitTransaction(
          'registerBloodUnit',
          data.unitId,
          data.unitCode,
          data.bloodGroup,
          data.organizationId,
          data.dataHash,
          data.timestamp
        );
        return result.toString();
      } catch (error) {
        console.error('[Fabric] Failed to register blood unit:', error);
        throw error;
      }
    }

    // Mock mode
    const txId = generateTxId();
    const bloodUnit: BloodUnitOnChain = {
      unitId: data.unitId,
      unitCode: data.unitCode,
      bloodGroup: data.bloodGroup,
      status: 'COLLECTED',
      owner: data.organizationId,
      dataHash: data.dataHash,
      createdTime: data.timestamp,
      lastUpdatedTime: data.timestamp,
      testHashes: [],
      transfers: [],
    };

    await putState(
      txId,
      data.unitId,
      JSON.stringify(bloodUnit),
      'BloodUnitRegistered',
      JSON.stringify({
        unitId: data.unitId,
        unitCode: data.unitCode,
        bloodGroup: data.bloodGroup,
        organizationId: data.organizationId,
        timestamp: data.timestamp,
      })
    );

    console.log(`[Mock Blockchain] Blood unit registered: ${data.unitId}`);
    return txId;
  },

  /**
   * Update blood unit status on blockchain
   */
  async updateBloodStatus(data: StatusUpdateData): Promise<string> {
    if (mode === 'fabric') {
      try {
        const c = await getContract();
        const result = await c.submitTransaction(
          'updateBloodStatus',
          data.unitId,
          data.status,
          data.updatedBy,
          data.timestamp
        );
        return result.toString();
      } catch (error) {
        console.error('[Fabric] Failed to update blood status:', error);
        throw error;
      }
    }

    // Mock mode
    const txId = generateTxId();
    const current = await getState(data.unitId);
    if (!current) {
      throw new Error(`Blood unit ${data.unitId} does not exist`);
    }

    const bloodUnit: BloodUnitOnChain = JSON.parse(current);
    bloodUnit.status = data.status;
    bloodUnit.lastUpdatedTime = data.timestamp;

    await putState(
      txId,
      data.unitId,
      JSON.stringify(bloodUnit),
      'BloodStatusUpdated',
      JSON.stringify(data)
    );

    console.log(`[Mock Blockchain] Blood unit status updated: ${data.unitId} -> ${data.status}`);
    return txId;
  },

  /**
   * Record test status on blockchain
   */
  async recordTestStatus(data: TestStatusData): Promise<string> {
    if (mode === 'fabric') {
      try {
        const c = await getContract();
        const result = await c.submitTransaction(
          'recordTestStatus',
          data.unitId,
          data.testType,
          data.resultHash,
          data.status,
          data.timestamp
        );
        return result.toString();
      } catch (error) {
        console.error('[Fabric] Failed to record test status:', error);
        throw error;
      }
    }

    // Mock mode
    const txId = generateTxId();
    const current = await getState(data.unitId);
    if (!current) {
      throw new Error(`Blood unit ${data.unitId} does not exist`);
    }

    const bloodUnit: BloodUnitOnChain = JSON.parse(current);
    bloodUnit.testHashes.push({
      testType: data.testType,
      resultHash: data.resultHash,
      status: data.status,
      timestamp: data.timestamp,
    });
    bloodUnit.lastUpdatedTime = data.timestamp;

    await putState(
      txId,
      data.unitId,
      JSON.stringify(bloodUnit),
      'TestRecorded',
      JSON.stringify(data)
    );

    console.log(`[Mock Blockchain] Test recorded for unit: ${data.unitId}`);
    return txId;
  },

  /**
   * Transfer blood unit ownership on blockchain
   */
  async transferBloodUnit(data: TransferData): Promise<string> {
    if (mode === 'fabric') {
      try {
        const c = await getContract();
        const result = await c.submitTransaction(
          'transferBloodUnit',
          data.unitId,
          data.fromOrgId,
          data.toOrgId,
          data.transferredBy,
          data.timestamp
        );
        return result.toString();
      } catch (error) {
        console.error('[Fabric] Failed to transfer blood unit:', error);
        throw error;
      }
    }

    // Mock mode
    const txId = generateTxId();
    const current = await getState(data.unitId);
    if (!current) {
      throw new Error(`Blood unit ${data.unitId} does not exist`);
    }

    const bloodUnit: BloodUnitOnChain = JSON.parse(current);
    bloodUnit.transfers.push({
      from: data.fromOrgId,
      to: data.toOrgId,
      transferredBy: data.transferredBy,
      timestamp: data.timestamp,
    });
    bloodUnit.owner = data.toOrgId;
    bloodUnit.status = 'ISSUED';
    bloodUnit.lastUpdatedTime = data.timestamp;

    await putState(
      txId,
      data.unitId,
      JSON.stringify(bloodUnit),
      'BloodUnitTransferred',
      JSON.stringify(data)
    );

    console.log(`[Mock Blockchain] Blood unit transferred: ${data.unitId}`);
    return txId;
  },

  /**
   * Record consent on blockchain
   */
  async recordConsent(data: ConsentData): Promise<string> {
    if (mode === 'fabric') {
      try {
        const c = await getContract();
        const result = await c.submitTransaction(
          'recordConsent',
          data.donorId,
          data.consentType,
          data.grantedTo,
          data.status,
          data.timestamp
        );
        return result.toString();
      } catch (error) {
        console.error('[Fabric] Failed to record consent:', error);
        throw error;
      }
    }

    // Mock mode
    const txId = generateTxId();
    const key = `consent_${data.donorId}_${data.consentType}_${data.grantedTo}`;

    await putState(
      txId,
      key,
      JSON.stringify(data),
      'ConsentRecorded',
      JSON.stringify(data)
    );

    console.log(`[Mock Blockchain] Consent recorded for donor: ${data.donorId}`);
    return txId;
  },

  /**
   * Get blood unit trace history
   */
  async getBloodTrace(unitId: string): Promise<{
    currentState: BloodUnitOnChain | null;
    history: Array<{ txId: string; timestamp: Date; value: BloodUnitOnChain }>;
  }> {
    if (mode === 'fabric') {
      try {
        const c = await getContract();
        const result = await c.evaluateTransaction('getBloodTrace', unitId);
        return JSON.parse(result.toString());
      } catch (error) {
        console.error('[Fabric] Failed to get blood trace:', error);
        throw error;
      }
    }

    // Mock mode
    const records = await prisma.blockchainLedger.findMany({
      where: { key: unitId },
      orderBy: { blockNumber: 'asc' },
    });

    if (records.length === 0) {
      return { currentState: null, history: [] };
    }

    const history = records.map((record) => ({
      txId: record.txId,
      timestamp: record.timestamp,
      value: JSON.parse(record.value) as BloodUnitOnChain,
    }));

    const currentState = history[history.length - 1].value;
    return { currentState, history };
  },

  /**
   * Get test hash from blockchain
   */
  async getTestHash(unitId: string, testType: string): Promise<string | null> {
    if (mode === 'fabric') {
      try {
        const c = await getContract();
        const result = await c.evaluateTransaction('getTestHash', unitId, testType);
        return result.toString();
      } catch (error) {
        console.error('[Fabric] Failed to get test hash:', error);
        throw error;
      }
    }

    // Mock mode
    const state = await getState(unitId);
    if (!state) return null;

    const bloodUnit: BloodUnitOnChain = JSON.parse(state);
    const test = bloodUnit.testHashes.find((t) => t.testType === testType);
    return test?.resultHash || null;
  },

  /**
   * Check blockchain network health
   */
  async checkHealth(): Promise<boolean> {
    if (mode === 'fabric') {
      try {
        await getContract();
        return true;
      } catch {
        return false;
      }
    }
    // Mock mode - always healthy if DB is connected
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Disconnect from the gateway
   */
  async disconnect(): Promise<void> {
    if (gateway) {
      gateway.disconnect();
      gateway = null;
      contract = null;
    }
  },

  /**
   * Get blockchain events (mock mode only)
   */
  async getEvents(eventName?: string, limit: number = 100): Promise<
    Array<{
      name: string;
      payload: Record<string, unknown>;
      txId: string;
      timestamp: Date;
    }>
  > {
    const where: Record<string, unknown> = {};
    if (eventName) where.eventName = eventName;

    const records = await prisma.blockchainLedger.findMany({
      where,
      orderBy: { blockNumber: 'desc' },
      take: limit,
    });

    return records
      .filter((r) => r.eventName && r.eventPayload)
      .map((record) => ({
        name: record.eventName!,
        payload: JSON.parse(record.eventPayload!) as Record<string, unknown>,
        txId: record.txId,
        timestamp: record.timestamp,
      }));
  },
};

// Helper to generate data hash
export function hashData(data: Record<string, unknown>): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

export default fabricService;
