// base on: https://github.com/DodoTheDeveloper/solc-js-compile-0.5.2-0.5.x/blob/master/compile.js

const path = require("path");
const fs = require("fs");
const solc = require("solc");

const inboxPath = path.resolve(__dirname, "contracts", "inbox.sol");
const source = fs.readFileSync(inboxPath, "utf-8");


var input = {
    language: 'Solidity',
    sources: {
        'inbox.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};


module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts['inbox.sol']['Inbox'];