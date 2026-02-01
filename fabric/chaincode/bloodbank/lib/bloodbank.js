'use strict';

const { Contract } = require('fabric-contract-api');

class BloodBankContract extends Contract {
  constructor() {
    super('BloodBankContract');
  }

  async initLedger(ctx) {
    console.log('Blood Bank Chaincode initialized');
    return JSON.stringify({ status: 'initialized' });
  }

  /**
   * Register a new blood unit
   */
  async registerBloodUnit(ctx, unitId, unitCode, bloodGroup, organizationId, dataHash, timestamp) {
    const bloodUnit = {
      docType: 'bloodUnit',
      unitId,
      unitCode,
      bloodGroup,
      status: 'COLLECTED',
      owner: organizationId,
      dataHash,
      createdTime: timestamp,
      lastUpdatedTime: timestamp,
      testHashes: [],
      transfers: [],
    };

    await ctx.stub.putState(unitId, Buffer.from(JSON.stringify(bloodUnit)));

    // Emit event
    ctx.stub.setEvent('BloodUnitRegistered', Buffer.from(JSON.stringify({
      unitId,
      unitCode,
      bloodGroup,
      organizationId,
      timestamp,
    })));

    return ctx.stub.getTxID();
  }

  /**
   * Update blood unit status
   */
  async updateBloodStatus(ctx, unitId, status, updatedBy, timestamp) {
    const bloodUnitBytes = await ctx.stub.getState(unitId);
    if (!bloodUnitBytes || bloodUnitBytes.length === 0) {
      throw new Error(`Blood unit ${unitId} does not exist`);
    }

    const bloodUnit = JSON.parse(bloodUnitBytes.toString());
    bloodUnit.status = status;
    bloodUnit.lastUpdatedTime = timestamp;

    await ctx.stub.putState(unitId, Buffer.from(JSON.stringify(bloodUnit)));

    ctx.stub.setEvent('BloodStatusUpdated', Buffer.from(JSON.stringify({
      unitId,
      status,
      updatedBy,
      timestamp,
    })));

    return ctx.stub.getTxID();
  }

  /**
   * Record test result hash
   */
  async recordTestStatus(ctx, unitId, testType, resultHash, status, timestamp) {
    const bloodUnitBytes = await ctx.stub.getState(unitId);
    if (!bloodUnitBytes || bloodUnitBytes.length === 0) {
      throw new Error(`Blood unit ${unitId} does not exist`);
    }

    const bloodUnit = JSON.parse(bloodUnitBytes.toString());
    bloodUnit.testHashes.push({
      testType,
      resultHash,
      status,
      timestamp,
    });
    bloodUnit.lastUpdatedTime = timestamp;

    await ctx.stub.putState(unitId, Buffer.from(JSON.stringify(bloodUnit)));

    ctx.stub.setEvent('TestRecorded', Buffer.from(JSON.stringify({
      unitId,
      testType,
      resultHash,
      status,
      timestamp,
    })));

    return ctx.stub.getTxID();
  }

  /**
   * Transfer blood unit ownership
   */
  async transferBloodUnit(ctx, unitId, fromOrgId, toOrgId, transferredBy, timestamp) {
    const bloodUnitBytes = await ctx.stub.getState(unitId);
    if (!bloodUnitBytes || bloodUnitBytes.length === 0) {
      throw new Error(`Blood unit ${unitId} does not exist`);
    }

    const bloodUnit = JSON.parse(bloodUnitBytes.toString());

    // Record transfer
    bloodUnit.transfers.push({
      from: fromOrgId,
      to: toOrgId,
      transferredBy,
      timestamp,
    });

    bloodUnit.owner = toOrgId;
    bloodUnit.status = 'ISSUED';
    bloodUnit.lastUpdatedTime = timestamp;

    await ctx.stub.putState(unitId, Buffer.from(JSON.stringify(bloodUnit)));

    ctx.stub.setEvent('BloodUnitTransferred', Buffer.from(JSON.stringify({
      unitId,
      fromOrgId,
      toOrgId,
      transferredBy,
      timestamp,
    })));

    return ctx.stub.getTxID();
  }

  /**
   * Record consent
   */
  async recordConsent(ctx, donorId, consentType, grantedTo, status, timestamp) {
    const consentKey = `consent_${donorId}_${consentType}_${grantedTo}`;

    const consent = {
      docType: 'consent',
      donorId,
      consentType,
      grantedTo,
      status,
      timestamp,
    };

    await ctx.stub.putState(consentKey, Buffer.from(JSON.stringify(consent)));

    ctx.stub.setEvent('ConsentRecorded', Buffer.from(JSON.stringify({
      donorId,
      consentType,
      grantedTo,
      status,
      timestamp,
    })));

    return ctx.stub.getTxID();
  }

  /**
   * Get blood unit trace history
   */
  async getBloodTrace(ctx, unitId) {
    const bloodUnitBytes = await ctx.stub.getState(unitId);
    if (!bloodUnitBytes || bloodUnitBytes.length === 0) {
      throw new Error(`Blood unit ${unitId} does not exist`);
    }

    const bloodUnit = JSON.parse(bloodUnitBytes.toString());

    // Get history
    const iterator = await ctx.stub.getHistoryForKey(unitId);
    const history = [];

    let result = await iterator.next();
    while (!result.done) {
      const record = {
        txId: result.value.txId,
        timestamp: result.value.timestamp,
        isDelete: result.value.isDelete,
      };

      if (!result.value.isDelete) {
        record.value = JSON.parse(result.value.value.toString('utf8'));
      }

      history.push(record);
      result = await iterator.next();
    }
    await iterator.close();

    return JSON.stringify({
      currentState: bloodUnit,
      history,
    });
  }

  /**
   * Get test hash from blockchain
   */
  async getTestHash(ctx, unitId, testType) {
    const bloodUnitBytes = await ctx.stub.getState(unitId);
    if (!bloodUnitBytes || bloodUnitBytes.length === 0) {
      throw new Error(`Blood unit ${unitId} does not exist`);
    }

    const bloodUnit = JSON.parse(bloodUnitBytes.toString());
    const test = bloodUnit.testHashes.find(t => t.testType === testType);

    if (!test) {
      throw new Error(`Test ${testType} not found for unit ${unitId}`);
    }

    return test.resultHash;
  }

  /**
   * Query blood units by status
   */
  async queryByStatus(ctx, status) {
    const queryString = {
      selector: {
        docType: 'bloodUnit',
        status,
      },
    };

    const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
    const results = [];

    let result = await iterator.next();
    while (!result.done) {
      const record = JSON.parse(result.value.value.toString('utf8'));
      results.push(record);
      result = await iterator.next();
    }
    await iterator.close();

    return JSON.stringify(results);
  }

  /**
   * Query blood units by organization
   */
  async queryByOrganization(ctx, organizationId) {
    const queryString = {
      selector: {
        docType: 'bloodUnit',
        owner: organizationId,
      },
    };

    const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
    const results = [];

    let result = await iterator.next();
    while (!result.done) {
      const record = JSON.parse(result.value.value.toString('utf8'));
      results.push(record);
      result = await iterator.next();
    }
    await iterator.close();

    return JSON.stringify(results);
  }
}

module.exports = BloodBankContract;
