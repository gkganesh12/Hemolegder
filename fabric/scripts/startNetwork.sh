#!/bin/bash
# Start the Blood Bank Fabric Network
# This script assumes binaries are already downloaded

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NETWORK_DIR="$SCRIPT_DIR/../network"
BIN_DIR="$SCRIPT_DIR/../bin"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

cd "$NETWORK_DIR"

# Check if binaries exist
if [ ! -d "$BIN_DIR" ]; then
    log "Downloading Fabric binaries..."
    cd "$SCRIPT_DIR/.."
    curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/bootstrap.sh | bash -s -- 2.5.0 1.5.6 -s -d
    cd "$NETWORK_DIR"
fi

# Clean previous network
log "Cleaning previous network..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true
rm -rf crypto-config config

# Generate crypto materials
log "Generating crypto materials..."
"$BIN_DIR/cryptogen" generate --config=crypto-config.yaml --output=crypto-config

# Generate genesis block
log "Generating genesis block..."
mkdir -p config
export FABRIC_CFG_PATH="$NETWORK_DIR"
"$BIN_DIR/configtxgen" -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./config/genesis.block

# Generate channel transaction
log "Generating channel transaction..."
"$BIN_DIR/configtxgen" -profile BloodBankChannel -outputCreateChannelTx ./config/bloodchannel.tx -channelID bloodchannel

# Start Docker containers
log "Starting Docker containers..."
docker-compose up -d

log "Waiting for containers to start..."
sleep 10

# Create channel using CLI container
log "Creating channel..."
docker exec cli peer channel create -o orderer.example.com:7050 -c bloodchannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/bloodchannel.tx

# Join peers to channel
log "Joining BloodBank peer to channel..."
docker exec cli peer channel join -b bloodchannel.block

log "Joining Hospital peer to channel..."
docker exec -e CORE_PEER_ADDRESS=peer0.hospital.example.com:9051 -e CORE_PEER_LOCALMSPID=HospitalMSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.example.com/users/Admin@hospital.example.com/msp cli peer channel join -b bloodchannel.block

log "Joining Regulator peer to channel..."
docker exec -e CORE_PEER_ADDRESS=peer0.regulator.example.com:11051 -e CORE_PEER_LOCALMSPID=RegulatorMSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/regulator.example.com/users/Admin@regulator.example.com/msp cli peer channel join -b bloodchannel.block

log "=========================================="
log "Network started successfully!"
log "=========================================="
log ""
log "Channel: bloodchannel"
log "Peers:"
log "  - peer0.bloodbank.example.com:7051"
log "  - peer0.hospital.example.com:9051"
log "  - peer0.regulator.example.com:11051"
log ""
log "To deploy chaincode, run: ./deployChaincode.sh"
