'use strict';

const BloodBankContract = require('./lib/bloodbank');

// Check if running as external chaincode server
if (process.env.CHAINCODE_SERVER_ADDRESS) {
    const shim = require('fabric-shim');
    const ChaincodeFromContract = require('fabric-shim/lib/contract-spi/chaincodefromcontract');
    const { JSONSerializer } = require('fabric-contract-api');

    const serializers = {
        transaction: 'jsonSerializer',
        serializers: {
            jsonSerializer: JSONSerializer
        }
    };

    const chaincode = new ChaincodeFromContract([BloodBankContract], serializers, {}, 'BloodBank', '1.0');

    const server = shim.server(chaincode, {
        ccid: process.env.CHAINCODE_ID,
        address: process.env.CHAINCODE_SERVER_ADDRESS
    });

    server.start().then(() => {
        console.log('Chaincode server started successfully');
    }).catch((err) => {
        console.error('Error starting chaincode server:', err);
        process.exit(1);
    });
} else {
    // Standard export for peer-managed chaincode
    module.exports.BloodBankContract = BloodBankContract;
    module.exports.contracts = [BloodBankContract];
}
