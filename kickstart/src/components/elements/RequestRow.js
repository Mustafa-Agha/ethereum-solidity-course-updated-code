import React, { Component } from "react";
import { Table, Label, Button, Icon } from "semantic-ui-react";
import { web3, Campaign } from "@ethereum";

const { Row, Cell } = Table;

class RequestRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Aloading: false,
            Floading: false,
        };
    }

    handleApprove = async () => {
        const { address, id, cb } = this.props;

        try {
            this.setState({ Aloading: true });
            cb(false, true, 'Transaction', 'Waiting on Transaction success...');
            const campaign = Campaign(address);
            const accounts = await web3.eth.getAccounts();
            await campaign.methods.approveRequest(id).send({ from: accounts[0] });
            this.setState({ Aloading: false });
            cb(false, true, 'Request Approved', 'Request has been Approved successfully');
        } catch(err) {
            let msg;
            if (err.code === 4001) {
                msg = err.message.split(":")[1];
            } else {
                msg = err.message;
            }

            this.setState({ Aloading: false });
            cb(true, false, 'Transaction Error', msg);
        }
    }

    handleFinalize = async () => {
        const { address, id, cb } = this.props;

        try {
            this.setState({ Floading: true });
            cb(false, true, 'Transaction', 'Waiting on Transaction success...');
            const campaign = Campaign(address);
            const accounts = await web3.eth.getAccounts();
            await campaign.methods.finalizeRequest(id).send({ from: accounts[0] });
            this.setState({ Floading: false });
            cb(false, true, 'Request Finalized', 'Request has been Finalized successfully');
        } catch(err) {
            let msg;
            if (err.code === 4001) {
                msg = err.message.split(":")[1];
            } else {
                msg = err.message;
            }

            this.setState({ Floading: false });
            cb(true, false, 'Transaction Error', msg);
        }
    }

    render() {
        const { request, id, approversCount } = this.props;
        const { description, value, recipient, approvalCount, complete } = request;
        const { Aloading, Floading } = this.state;
        const readyToFinalize = approvalCount > (approversCount / 2);

        return(
            <Row disabled={complete} positive={readyToFinalize && !complete}>
                <Cell><Label ribbon>{id}</Label></Cell>
                <Cell>{description}</Cell>
                <Cell>{web3.utils.fromWei(value, 'ether')}</Cell>
                <Cell>{recipient}</Cell>
                <Cell>{approvalCount}/{approversCount}</Cell>
                <Cell>
                    {
                        complete
                        ? (
                            <Icon color='green' name='checkmark' size='large' />
                        )
                        : <Button disabled={Aloading} loading={Aloading} onClick={this.handleApprove}           color="green" basic>Approve</Button>
                    }
                </Cell>
                <Cell>
                    {
                        complete
                        ? (
                            <Icon color='green' name='checkmark' size='large' />
                        )
                        : <Button disabled={Floading} loading={Floading} onClick={this.handleFinalize} color="teal" basic>Finalize</Button>
                    }
                </Cell>
            </Row>
        );
    }
}

export default RequestRow;