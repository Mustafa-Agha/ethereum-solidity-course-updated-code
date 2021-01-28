import React, { Component } from "react";
import ErrorPage from "next/error";
import { Container, Form, Input, Button, Message } from "semantic-ui-react";
import Layout from "@layouts";
import { Router } from "@routes";
import { Header } from "@elements";
import { Campaign, web3 } from "@ethereum";


class RequestNew extends Component {
  static async getInitialProps({ query }) {
    try {
      const address = query.address;
      return { address };
    } catch (err) {
      return { err };
    }
  }

  state = {
    description: "",
    amount: "",
    recipient: "",
    msgHeader: "",
    msgContent: "",
    fLoading: false,
    success: false,
    error: false,
  };

  handleInput = (e) => {
    const { value, name } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { address } = this.props;
    const { recipient, amount, description } = this.state;

    try {
        if (amount > 0 && description.length && web3.utils.isAddress(recipient)) {
          this.setState({
            fLoading: true,
            success: true,
            error: false,
            msgHeader: "Transaction",
            msgContent: "Waiting on Transaction success...",
          });
  
          const campaign = Campaign(address);
          const accounts = await web3.eth.getAccounts();
          await campaign.methods.createRequest(description, web3.utils.toWei(amount, 'ether'), recipient).send({
            from: accounts[0],
          });
  
          this.setState({
            fLoading: false,
            success: true,
            error: false,
            msgHeader: "Congratulations!",
            msgContent: "You've created a request",
            description: "",
            amount: "",
            recipient: "",
          });

        } else {
            this.setState({
                fLoading: false,
                success: false,
                error: true,
                msgHeader: "Invalid Data Input",
                msgContent: "Please provide a valid ethereum address",
            });
        }
    } catch(err) {
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
    }
  }

  render() {
    const { address, err } = this.props;
    const {
      description,
      amount,
      recipient,
      fLoading,
      error,
      success,
      msgHeader,
      msgContent,
    } = this.state;

    if (err) {
      // ERROR HANDLING IF QUERY IS WRONGLY ENTERED
      return <ErrorPage statusCode={404} />;
    }

    return (
      <Layout>
        <Header
          back
          route={`/campaigns/${address}/requests`}
          text="Create A Request"
          divider
        />
        <Container textAlign="center" text>
          <Form
            style={{ marginTop: "5rem" }}
            onSubmit={this.handleSubmit}
            error={error}
            success={success}
            loading={fLoading}
          >
            <Form.Field>
              <label style={{ marginBottom: "4px" }} className="text-uppercase">
                Request Description
              </label>
              <Input
                required
                onChange={this.handleInput}
                value={description}
                name="description"
                icon="question circle"
                iconPosition="left"
                placeholder="Description..."
              />
              <label
                style={{ marginBottom: "4px", marginTop: "2rem" }}
                className="text-uppercase"
              >
                Request Amount (ETH)
              </label>
              <Input
                required
                onChange={this.handleInput}
                type="number"
                value={amount}
                name="amount"
                icon="money bill alternate"
                iconPosition="left"
                placeholder="Withdraw amount..."
              />
              <label style={{ marginTop: "2rem" }} className="text-uppercase">
                Request Recipient
              </label>
              <Input
                required
                onChange={this.handleInput}
                value={recipient}
                name="recipient"
                icon="ethereum"
                iconPosition="left"
                placeholder="Recipient address..."
              />
            </Form.Field>
            <Button primary type="submit">
              CREATE REQUEST
            </Button>
            <Message success header={msgHeader} content={msgContent} />
            <Message error header={msgHeader} content={msgContent} />
          </Form>
        </Container>
      </Layout>
    );
  }
}

export default RequestNew;
