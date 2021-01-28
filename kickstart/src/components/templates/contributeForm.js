import React, { Component } from "react";
import {
    Form,
    Button,
    Input,
    Label,
    Message,
} from "semantic-ui-react";

import { Router } from "@routes";
import { web3, Campaign } from "@ethereum";

class ContributeForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            msgHeader: "",
            msgContent: "",
            fLoading: false,
            success: false,
            error: false,
        };
    }

    handleAmountInput = (e) => {
        const { value } = e.target;
        this.setState({ amount: value });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const { amount } = this.state;
        const { mc, ca } = this.props;
    
        try {
          if (Number(amount) >= Number(web3.utils.fromWei(mc, 'ether'))) {
            this.setState({
              fLoading: true,
              success: true,
              error: false,
              msgHeader: "Transaction",
              msgContent: "Waiting on Transaction success...",
            });

            this.handleUpdateMsgs({
                success: true,
                error: false,
                msgHeader: "Transaction",
                msgContent: "Waiting on Transaction success...",
            });
    
            const campaign = Campaign(ca);
            const accounts = await web3.eth.getAccounts();
            await campaign.methods.contribute().send({
              from: accounts[0],
              value: web3.utils.toWei(amount, 'ether'),
            });
    
            this.setState({
              fLoading: false,
              success: true,
              error: false,
              msgHeader: "Congratulations!",
              msgContent: "You're now an approver",
              amount: "",
            });

            this.handleUpdateMsgs({
                success: true,
                error: false,
                msgHeader: "Congratulations!",
                msgContent: "You're now an approver",
            });
    
            setTimeout(() => {
                Router.replaceRoute('/campaigns/' + ca);
                setTimeout(() => {
                    this.setState({ error: false, success: false, msgHeader: '', msgContent: '' });
                    this.handleUpdateMsgs({ error: false, success: false, msgHeader: '', msgContent: '' });
                }, 4000);
            }, 1000);
    
          } else {
            this.setState({
              fLoading: false,
              success: false,
              error: true,
              msgHeader: "Minimu Contribution",
              msgContent: "Amount must be greater than Minimum Contribution",
            });
            this.handleUpdateMsgs({
                success: false,
                error: true,
                msgHeader: "Minimu Contribution",
                msgContent: "Amount must be greater than Minimum Contribution",
            });
          }
        } catch (err) {
          let msg;
          if (err.code === 4001) {
            msg = err.message.split(":")[1];
          } else {
            msg = err.message;
          }
    
          this.setState({
            fLoading: false,
            success: false,
            error: true,
            msgHeader: "Transaction Error",
            msgContent: msg,
          });

          this.handleUpdateMsgs({
            success: false,
            error: true,
            msgHeader: "Transaction Error",
            msgContent: msg,
          });
    
        }
    };

    handleUpdateMsgs = (msgObj) => {
        const { updateMsgs } = this.props;
        updateMsgs(msgObj);
    }

    render() {
        const { style, showMsgs } = this.props;
        const { error, success, fLoading, msgHeader, msgContent, amount } = this.state;

        return(
            <Form
                style={style}
                onSubmit={this.handleSubmit}
                error={error}
                success={success}
                loading={fLoading}
            >
                <Form.Field style={{ marginBottom: '4px' }}>
                    <Input
                        labelPosition="right"
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={this.handleAmountInput}
                    >
                        <Label basic>&#9830;</Label>
                        <input />
                        <Label>ETH</Label>
                    </Input>
                </Form.Field>
                <Button primary type="submit">
                    CONTRIBUTE
                </Button>
                {
                    showMsgs
                    ? <>
                        <Message success header={msgHeader} content={msgContent} />
                        <Message error header={msgHeader} content={msgContent} />
                    </>
                    : null
                }
            </Form>
        );
    }
}

export default ContributeForm;