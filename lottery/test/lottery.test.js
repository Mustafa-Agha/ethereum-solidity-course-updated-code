const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");

const cConfig = {
    cColors: {
        green: '\x1b[36m%s\x1b[32m',
        yellow: '\x1b[36m%s\x1b[33m',
        red: '\x1b[36m%s\x1b[31m'
    },
    cUnicodes: {
        check: '✓',
        cross: '⨯',
        gas: '⧫'
    },
    cSpaces: (ns) => Array(ns + 1).join(" ")
};

let lottery;
let accounts;


beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    const contract = await new web3.eth.Contract(abi);
    const deploy = await contract.deploy({ data: '0x' + evm.bytecode.object });
    lottery = await deploy.send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        const multiAccounts = accounts.slice(0, 3);

        for (let i = 0; i < multiAccounts.length; i++) {
            await lottery.methods.enter().send({
                from: accounts[i],
                value: web3.utils.toWei('0.02', 'ether')
            });
        }

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        for (let i = 0; i < multiAccounts.length; i++) {
            assert.strictEqual(accounts[i], players[i]);
        }

        assert.strictEqual(3, players.length);
    });

    it('requires a min amount of ETH(0.11) to enter', async () => {
        // ASSERT REJECTS METHODS
        await assert.rejects(async () => {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.01', 'ether')
            });
        }, (err) => {
            console.log(
                cConfig.cColors.green,
                cConfig.cSpaces(3),
                cConfig.cUnicodes.check,
                err.results[Object.keys(err.results)[0]]['reason']
            );
            assert(err);
            return true;
        });
    });

    it('requires admin privileges', async () => {
        await assert.rejects(async () => {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
        }, (err) => {
            console.log(
                cConfig.cColors.green,
                cConfig.cSpaces(3),
                cConfig.cUnicodes.check,
                err.results[Object.keys(err.results)[0]]['reason']
            );
            assert(err);
            return true;
        });
    });

    it('lottery (sends money to winner + resets players[])', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initBalance;

        console.log(
            cConfig.cColors.yellow,
            cConfig.cSpaces(3),
            cConfig.cUnicodes.gas,
            web3.utils.fromWei((difference).toString(), 'ether'),
            'ETH'
        );
        assert(difference > web3.utils.toWei('1.8', 'ether'));

        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
        const contractBalance = await web3.eth.getBalance(lottery.options.address);

        assert.strictEqual(0, players.length);
        assert.strictEqual(0, Number(contractBalance));
    });
});