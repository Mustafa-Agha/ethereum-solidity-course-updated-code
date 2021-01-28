import React, { Component } from "react";
import {
  Form,
  Button,
  Container,
  Input,
  Label,
  Message,
} from "semantic-ui-react";
import Layout from "@layouts";
import { Header } from "@elements";
import { Router } from "@routes";
import { factory, web3 } from "@ethereum";

class New extends Component {
  state = {
    minimumContribution: "",
    msgHeader: "",
    msgContent: "",
    fLoading: false,
    success: false,
    error: false,
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { minimumContribution } = this.state;

    try {
      if (Number(minimumContribution) > 0) {
        this.setState({
          fLoading: true,
          success: true,
          error: false,
          msgHeader: "Transaction",
          msgContent: "Waiting on Transaction success...",
        });

        const accounts = await web3.eth.getAccounts();
        await factory.methods.createCampaign(minimumContribution).send({
          from: accounts[0],
        });

        this.setState({
          fLoading: false,
          success: true,
          error: false,
          msgHeader: "Congratulations!",
          msgContent: "You've created a campaign",
          minimumContribution: "",
        });

        setTimeout(() => {
            Router.pushRoute('/');
        }, 1000);

      } else {
        this.setState({
          fLoading: false,
          success: false,
          error: true,
          msgHeader: "Minimu Contribution",
          msgContent: "Minimum Contribution is required",
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

    }
  };

  handleMinimumContributionInput = (e) => {
    const { value } = e.target;
    this.setState({ minimumContribution: value });
  };

  render() {
    const {
      fLoading,
      minimumContribution,
      error,
      success,
      msgHeader,
      msgContent,
    } = this.state;

    return (
      <Layout>
        <Header text="Create a Campaign" divider />
        <Container textAlign="center" text>
          <Form
            style={{ marginTop: "10rem" }}
            onSubmit={this.handleSubmit}
            error={error}
            success={success}
            loading={fLoading}
          >
            <Form.Field>
              <label
                style={{ marginBottom: "2rem" }}
                className="text-uppercase"
              >
                Minimum Contribution
              </label>
              <Input
                labelPosition="right"
                type="number"
                placeholder="Amount"
                value={minimumContribution}
                onChange={this.handleMinimumContributionInput}
              >
                <Label basic>&#9830;</Label>
                <input />
                <Label>WEI</Label>
              </Input>
            </Form.Field>
            <Button primary type="submit">
              CREATE
            </Button>
            <Message success header={msgHeader} content={msgContent} />
            <Message error header={msgHeader} content={msgContent} />
          </Form>
        </Container>
      </Layout>
    );
  }
}

export default New;
