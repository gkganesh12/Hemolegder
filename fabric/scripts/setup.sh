#!/bin/bash
# Blood Bank Hyperledger Fabric Network Setup Script
# This script sets up the entire Fabric network from scratch

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NETWORK_DIR="$SCRIPT_DIR/../network"
CHAINCODE_DIR="$SCRIPT_DIR/../chaincode"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi

    log_info "Prerequisites check passed."
}

# Download Fabric binaries if not present
download_binaries() {
    if [ ! -d "$SCRIPT_DIR/../bin" ]; then
        log_info "Downloading Hyperledger Fabric binaries..."

        cd "$SCRIPT_DIR/.."
        curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/bootstrap.sh | bash -s -- 2.5.0 1.5.6 -s -d

        log_info "Binaries downloaded."
    else
        log_info "Fabric binaries already exist."
    fi
}

# Generate crypto materials
generate_crypto() {
    log_info "Generating crypto materials..."

    cd "$NETWORK_DIR"

    # Remove existing crypto materials
    rm -rf crypto-config

    # Generate using cryptogen
    "$SCRIPT_DIR/../bin/cryptogen" generate --config=crypto-config.yaml --output=crypto-config

    log_info "Crypto materials generated."
}

# Generate genesis block and channel artifacts
generate_artifacts() {
    log_info "Generating channel artifacts..."

    cd "$NETWORK_DIR"

    # Create config directory
    mkdir -p config

    export FABRIC_CFG_PATH="$NETWORK_DIR"

    # Generate genesis block
    "$SCRIPT_DIR/../bin/configtxgen" -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./config/genesis.block

    # Generate channel transaction
    "$SCRIPT_DIR/../bin/configtxgen" -profile BloodBankChannel -outputCreateChannelTx ./config/bloodchannel.tx -channelID bloodchannel

    # Generate anchor peer transactions
    "$SCRIPT_DIR/../bin/configtxgen" -profile BloodBankChannel -outputAnchorPeersUpdate ./config/BloodBankMSPanchors.tx -channelID bloodchannel -asOrg BloodBankOrg
    "$SCRIPT_DIR/../bin/configtxgen" -profile BloodBankChannel -outputAnchorPeersUpdate ./config/HospitalMSPanchors.tx -channelID bloodchannel -asOrg HospitalOrg
    "$SCRIPT_DIR/../bin/configtxgen" -profile BloodBankChannel -outputAnchorPeersUpdate ./config/RegulatorMSPanchors.tx -channelID bloodchannel -asOrg RegulatorOrg

    log_info "Channel artifacts generated."
}

# Start the network
start_network() {
    log_info "Starting Fabric network..."

    cd "$NETWORK_DIR"

    # Create peer volumes
    mkdir -p peers/bloodbank peers/hospital peers/regulator orderer

    docker-compose up -d

    log_info "Waiting for network to stabilize..."
    sleep 10

    log_info "Network started."
}

# Create and join channel
create_channel() {
    log_info "Creating channel..."

    cd "$NETWORK_DIR"

    # Create channel
    docker exec peer0.bloodbank.example.com peer channel create \
        -o orderer.example.com:7050 \
        -c bloodchannel \
        -f /etc/hyperledger/configtx/bloodchannel.tx

    sleep 2

    # Join BloodBank peer
    docker exec peer0.bloodbank.example.com peer channel join -b bloodchannel.block

    # Fetch channel block for other peers
    docker exec peer0.bloodbank.example.com peer channel fetch 0 bloodchannel.block -c bloodchannel -o orderer.example.com:7050

    # Copy block to other peers and join
    docker cp peer0.bloodbank.example.com:/opt/gopath/src/github.com/hyperledger/fabric/peer/bloodchannel.block ./bloodchannel.block
    docker cp ./bloodchannel.block peer0.hospital.example.com:/opt/gopath/src/github.com/hyperledger/fabric/peer/
    docker cp ./bloodchannel.block peer0.regulator.example.com:/opt/gopath/src/github.com/hyperledger/fabric/peer/

    docker exec peer0.hospital.example.com peer channel join -b bloodchannel.block
    docker exec peer0.regulator.example.com peer channel join -b bloodchannel.block

    rm -f ./bloodchannel.block

    log_info "Channel created and peers joined."
}

# Deploy chaincode
deploy_chaincode() {
    log_info "Deploying chaincode..."

    cd "$CHAINCODE_DIR/bloodbank"

    # Install npm dependencies
    npm install

    # Package chaincode
    docker exec peer0.bloodbank.example.com peer lifecycle chaincode package bloodbank.tar.gz \
        --path /opt/gopath/src/github.com/chaincode/bloodbank \
        --lang node \
        --label bloodbank_1.0

    # Install on all peers
    docker exec peer0.bloodbank.example.com peer lifecycle chaincode install bloodbank.tar.gz
    docker exec peer0.hospital.example.com peer lifecycle chaincode install bloodbank.tar.gz
    docker exec peer0.regulator.example.com peer lifecycle chaincode install bloodbank.tar.gz

    # Get package ID
    PACKAGE_ID=$(docker exec peer0.bloodbank.example.com peer lifecycle chaincode queryinstalled | grep bloodbank_1.0 | awk '{print $3}' | cut -d',' -f1)

    # Approve for each org
    docker exec peer0.bloodbank.example.com peer lifecycle chaincode approveformyorg \
        -o orderer.example.com:7050 \
        --channelID bloodchannel \
        --name bloodbank \
        --version 1.0 \
        --package-id $PACKAGE_ID \
        --sequence 1

    docker exec peer0.hospital.example.com peer lifecycle chaincode approveformyorg \
        -o orderer.example.com:7050 \
        --channelID bloodchannel \
        --name bloodbank \
        --version 1.0 \
        --package-id $PACKAGE_ID \
        --sequence 1

    docker exec peer0.regulator.example.com peer lifecycle chaincode approveformyorg \
        -o orderer.example.com:7050 \
        --channelID bloodchannel \
        --name bloodbank \
        --version 1.0 \
        --package-id $PACKAGE_ID \
        --sequence 1

    # Commit chaincode
    docker exec peer0.bloodbank.example.com peer lifecycle chaincode commit \
        -o orderer.example.com:7050 \
        --channelID bloodchannel \
        --name bloodbank \
        --version 1.0 \
        --sequence 1 \
        --peerAddresses peer0.bloodbank.example.com:7051 \
        --peerAddresses peer0.hospital.example.com:9051 \
        --peerAddresses peer0.regulator.example.com:11051

    log_info "Chaincode deployed."
}

# Main execution
main() {
    log_info "=========================================="
    log_info "Blood Bank Fabric Network Setup"
    log_info "=========================================="

    check_prerequisites
    download_binaries
    generate_crypto
    generate_artifacts
    start_network
    create_channel
    deploy_chaincode

    log_info "=========================================="
    log_info "Network setup complete!"
    log_info "=========================================="
    log_info ""
    log_info "Channel: bloodchannel"
    log_info "Chaincode: bloodbank"
    log_info ""
    log_info "Peers:"
    log_info "  - peer0.bloodbank.example.com:7051"
    log_info "  - peer0.hospital.example.com:9051"
    log_info "  - peer0.regulator.example.com:11051"
    log_info ""
    log_info "To stop the network: ./stopNetwork.sh"
}

main "$@"
