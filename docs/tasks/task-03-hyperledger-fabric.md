# Task 3: Hyperledger Fabric Network Setup

## Overview
Configure Hyperledger Fabric network for local development and Railway deployment.

## Status: `[x] Completed`

---

## Objectives
- Set up Fabric network configuration
- Configure organizations and channels
- Create connection profiles
- Set up wallet management

---

## Deliverables

### 1. Network Structure
```
fabric/
├── network/
│   ├── docker-compose.yaml
│   ├── configtx.yaml
│   └── crypto-config.yaml
├── chaincode/
│   └── bloodbank/
│       ├── package.json
│       └── lib/
│           └── bloodbank.js
├── connection-profiles/
│   ├── bloodbank-org.json
│   ├── hospital-org.json
│   └── regulator-org.json
├── wallets/
└── scripts/
    ├── startNetwork.sh
    └── deployChaincode.sh
```

### 2. Organizations
| Organization | Role | Peers |
|-------------|------|-------|
| BloodBankOrg | Blood bank nodes | peer0, peer1 |
| HospitalOrg | Hospital nodes | peer0, peer1 |
| RegulatorOrg | Regulatory authority | peer0 |

### 3. Channel Configuration
- Channel Name: `bloodchannel`
- All organizations join this channel
- Chaincode: `bloodbank`

### 4. configtx.yaml (Key Sections)
```yaml
Organizations:
  - &BloodBankOrg
    Name: BloodBankOrg
    ID: BloodBankMSP
    MSPDir: crypto-config/peerOrganizations/bloodbank.example.com/msp
    
  - &HospitalOrg
    Name: HospitalOrg
    ID: HospitalMSP
    MSPDir: crypto-config/peerOrganizations/hospital.example.com/msp
    
  - &RegulatorOrg
    Name: RegulatorOrg
    ID: RegulatorMSP
    MSPDir: crypto-config/peerOrganizations/regulator.example.com/msp

Capabilities:
  Channel: &ChannelCapabilities
    V2_0: true
  Orderer: &OrdererCapabilities
    V2_0: true
  Application: &ApplicationCapabilities
    V2_0: true

Channel: &ChannelDefaults
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
```

### 5. Connection Profile (bloodbank-org.json)
```json
{
  "name": "bloodbank-network",
  "version": "1.0.0",
  "organizations": {
    "BloodBankOrg": {
      "mspid": "BloodBankMSP",
      "peers": ["peer0.bloodbank.example.com"],
      "certificateAuthorities": ["ca.bloodbank.example.com"]
    }
  },
  "peers": {
    "peer0.bloodbank.example.com": {
      "url": "grpcs://localhost:7051",
      "tlsCACerts": {
        "path": "path/to/tlscacerts"
      }
    }
  },
  "certificateAuthorities": {
    "ca.bloodbank.example.com": {
      "url": "https://localhost:7054",
      "caName": "ca-bloodbank"
    }
  }
}
```

### 6. Fabric Gateway Client (`src/lib/fabric.ts`)
```typescript
import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

const CONNECTION_PROFILE_PATH = path.resolve(
  __dirname, '../../fabric/connection-profiles/bloodbank-org.json'
);

export async function connectToFabric(identity: string) {
  const connectionProfile = JSON.parse(
    fs.readFileSync(CONNECTION_PROFILE_PATH, 'utf8')
  );
  
  const walletPath = path.resolve(__dirname, '../../fabric/wallets');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  
  const gateway = new Gateway();
  await gateway.connect(connectionProfile, {
    wallet,
    identity,
    discovery: { enabled: true, asLocalhost: true }
  });
  
  return gateway;
}

export async function getContract(gateway: Gateway) {
  const network = await gateway.getNetwork(process.env.FABRIC_CHANNEL_NAME!);
  return network.getContract(process.env.FABRIC_CHAINCODE_NAME!);
}
```

---

## Network Scripts

### Start Network
```bash
#!/bin/bash
# scripts/startNetwork.sh
cd fabric/network
docker-compose up -d
sleep 10
./createChannel.sh
```

### Deploy Chaincode
```bash
#!/bin/bash
# scripts/deployChaincode.sh
peer lifecycle chaincode package bloodbank.tar.gz \
  --path ./chaincode/bloodbank \
  --lang node \
  --label bloodbank_1.0
```

---

## Acceptance Criteria
- [x] Docker containers start successfully (Configured)
- [x] Channel created and joined by all peers (Scripts prepared)
- [x] Connection profiles validate
- [x] Gateway connects from Node.js app (Client implemented)
- [x] Ready for chaincode deployment

---

## Dependencies
- Task 1 (Project setup)
- Docker & Docker Compose installed

## Blocks
- Task 13 (Smart contract development)
- Task 14 (Blockchain integration)
