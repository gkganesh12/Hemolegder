#!/bin/bash
# Deploy Blood Bank Chaincode as a Service

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHAINCODE_DIR="$SCRIPT_DIR/../chaincode/bloodbank"
CCAAS_DIR="$SCRIPT_DIR/../chaincode/bloodbank-ccaas"
NETWORK_DIR="$SCRIPT_DIR/../network"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

CC_NAME="bloodbank"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CHANNEL="bloodchannel"

# Install chaincode dependencies
log "Installing chaincode dependencies..."
cd "$CHAINCODE_DIR"
npm install

# Create ccaas package
log "Creating chaincode package..."
cd "$CCAAS_DIR"

# Create the tar.gz package with connection.json and metadata.json
tar czf code.tar.gz connection.json
tar czf ${CC_NAME}.tar.gz code.tar.gz metadata.json

# Copy to CLI container
docker cp ${CC_NAME}.tar.gz cli:/opt/gopath/src/github.com/hyperledger/fabric/peer/

# Install on BloodBank peer
log "Installing chaincode on BloodBank peer..."
docker exec cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Get package ID
log "Getting package ID..."
PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep "${CC_NAME}_${CC_VERSION}" | awk -F'Package ID: ' '{print $2}' | awk -F',' '{print $1}')
log "Package ID: $PACKAGE_ID"

if [ -z "$PACKAGE_ID" ]; then
    error "Failed to get package ID"
fi

# Install on Hospital peer
log "Installing chaincode on Hospital peer..."
docker exec -e CORE_PEER_ADDRESS=peer0.hospital.example.com:9051 \
    -e CORE_PEER_LOCALMSPID=HospitalMSP \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.example.com/users/Admin@hospital.example.com/msp \
    cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Install on Regulator peer
log "Installing chaincode on Regulator peer..."
docker exec -e CORE_PEER_ADDRESS=peer0.regulator.example.com:11051 \
    -e CORE_PEER_LOCALMSPID=RegulatorMSP \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/regulator.example.com/users/Admin@regulator.example.com/msp \
    cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Start the chaincode container with the correct package ID
log "Starting chaincode container..."
cd "$NETWORK_DIR"
export CHAINCODE_ID="$PACKAGE_ID"
docker-compose up -d chaincode-bloodbank

# Wait for chaincode to start
log "Waiting for chaincode container to start..."
sleep 5

# Approve for BloodBank org
log "Approving chaincode for BloodBank org..."
docker exec cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID $CHANNEL \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE

# Approve for Hospital org
log "Approving chaincode for Hospital org..."
docker exec -e CORE_PEER_ADDRESS=peer0.hospital.example.com:9051 \
    -e CORE_PEER_LOCALMSPID=HospitalMSP \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.example.com/users/Admin@hospital.example.com/msp \
    cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID $CHANNEL \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE

# Approve for Regulator org
log "Approving chaincode for Regulator org..."
docker exec -e CORE_PEER_ADDRESS=peer0.regulator.example.com:11051 \
    -e CORE_PEER_LOCALMSPID=RegulatorMSP \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/regulator.example.com/users/Admin@regulator.example.com/msp \
    cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID $CHANNEL \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE

# Commit chaincode
log "Committing chaincode..."
docker exec cli peer lifecycle chaincode commit \
    -o orderer.example.com:7050 \
    --channelID $CHANNEL \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --peerAddresses peer0.bloodbank.example.com:7051 \
    --peerAddresses peer0.hospital.example.com:9051 \
    --peerAddresses peer0.regulator.example.com:11051

# Verify chaincode is committed
log "Verifying chaincode..."
docker exec cli peer lifecycle chaincode querycommitted --channelID $CHANNEL --name $CC_NAME

log "=========================================="
log "Chaincode deployed successfully!"
log "=========================================="
log ""
log "Chaincode: $CC_NAME"
log "Version: $CC_VERSION"
log "Channel: $CHANNEL"
log "Package ID: $PACKAGE_ID"
