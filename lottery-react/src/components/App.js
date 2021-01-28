import React, { Component } from "react";

import { web3, lottery } from "./web3";

import './App.css';


class App extends Component {
  state = {
    manager: '',
    players: [],
    cBalance: '',
    lMoney: '',
    msg: '',
    msg2: '',
    error: false,
    error2: false,
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const cBalance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, cBalance });
  }

  enterLottery = async (e) => {
    e.preventDefault();
    const { lMoney } = this.state;

    try {
      if (Number(lMoney) >= 0.011) {
        const accounts = await web3.eth.getAccounts();
        this.setState({ error: false, msg: 'Waiting on Transaction success...' });
        await lottery.methods.enter().send({
          from: accounts[0],
          value: web3.utils.toWei(lMoney, 'ether')
        });
        this.setState({ msg: "Congratulations! You've entered the Lottery" });
        this.updateLotteryData();
      } else {
        this.setState({ error: true, msg: 'To enter the Lottery you need a minimum 0.011 of ETH' });
      }
    } catch(err) {
      let msg;
      if (err.code === 4001) {
        msg = err.message.split(':')[1];
      } else {
        msg = 'Something went wrong with transaction, please try again later..'
      }

      this.setState({ error: true, msg });
    }
  }

  pickAWinner = async () => {
    const { manager, players } = this.state;
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts[0].toLowerCase() === manager.toLowerCase()) {
        if (players.length >= 2) {
          this.setState({ error2: false, msg2: 'Waiting on Transaction success...' });
          await lottery.methods.pickWinner().send({
            from: accounts[0]
          });
          const winnerAddress = await lottery.methods.winner().call();
          this.setState({ error2: false, msg2: "A Winner Has been picked! " + winnerAddress });
          this.updateLotteryData();
        } else {
          this.setState({ error2: true, msg2: "Please Wait for a minimum of 2 or more Lottery participants" });
        }
      } else {
        this.setState({ error2: true, msg2: "This Action Requires Manager Privileges" });
      }
    } catch(err) {

      let msg2;
      if (err.code === 4001) {
        msg2 = err.message.split(':')[1];
      } else {
        msg2 = 'Something went wrong with transaction, please try again later..'
      }

      this.setState({ error2: true, msg2 });
    }
  }

  updateLotteryData = async () => {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const cBalance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, cBalance });
  }

  render() {
    const { manager, players, cBalance, lMoney, msg, msg2, error, error2 } = this.state;
    return (
      <div className="center">
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {manager}.
        </p>
        <p>
          There are currently <strong>{players.length}</strong> people entered,
          competing to win <strong>{web3.utils.fromWei(cBalance, 'ether')}</strong> ETH.
        </p>

        <hr />
        <form onSubmit={this.enterLottery}>
          <h4>Want to try your luck?</h4>
          <div>
            <label htmlFor="input-eth">Amount of ETH to enter</label>
            <input
              id="input-eth"
              className="ml-2"
              value={lMoney}
              onChange={e => this.setState({ lMoney: e.target.value })}
              placeholder="0 ETH"
            />
          </div>
          <button className="mt-2">Enter Lottery</button>
        </form>
        <div className={`${error ? 'text-red' : 'text-green'} mt-2`}>{msg}</div>

        <h4>Ready to Pick A Winner</h4>
        <button onClick={this.pickAWinner} className="mt-2">Pick A Winner</button>
        <div className={`${error2 ? 'text-red' : 'text-green'} mt-2`}>{msg2}</div>
      </div>
    );
  }
}

export default App;
