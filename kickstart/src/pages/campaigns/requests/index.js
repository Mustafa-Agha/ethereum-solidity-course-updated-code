import React, { Component } from "react";
import ErrorPage from "next/error";
import { Table, Icon, Message } from "semantic-ui-react";
import { Header, RequestRow } from "@elements";
import { Router } from "@routes";
import Layout from "@layouts";
import { Campaign } from "@ethereum";

const { Header: HeaderTable, HeaderCell, Row, Body } = Table;

class RequestIndex extends Component {
    static async getInitialProps({ query }) {
        try {
            const { address } = query;
            const campaign = Campaign(address);
            const requestsCount = await campaign.methods.requestsCount().call();
            const approversCount = await campaign.methods.approversCount().call();

            const requests = await Promise.all(
                Array(parseInt(requestsCount)).fill().map((_e, i) => {
                    return campaign.methods.requests(i).call();
                })
            );

            return { address, requests, requestsCount, approversCount };
        } catch(err) {
            return { err };
        }
    }

    state = {
        error: false,
        success: false,
        msgHeader: '',
        msgContent: '',
    };

    renderRow = () => {
        const { requests, address, approversCount } = this.props;

        return requests.map((r, i) => {
            return <RequestRow cb={this.cb} key={i} id={i} approversCount={approversCount} request={r} address={address} />
        });
    }

    cb = (error, success, msgHeader, msgContent) => {
        const { address } = this.props;
        this.setState({ error, success, msgContent, msgHeader });

        setTimeout(() => {
            Router.replaceRoute(`/campaigns/${address}/requests`);
        }, 2000);
    }
    
    render() {
        const { address, requestsCount, err } = this.props;
        const { error, success, msgHeader, msgContent } = this.state;

        if (err) {
            // ERROR HANDLING IF QUERY IS WRONGLY ENTERED
            return  <ErrorPage statusCode={404} />
        }

        return(
            <Layout>
                <Header add route={`/campaigns/${address}/requests/new`} text="View Requests" divider />
                {success ? <Message style={{ textAlign: 'center' }} success={success} header={msgHeader} content={msgContent} /> : null}
                {error ? <Message style={{ textAlign: 'center' }} error={error} header={msgHeader} content={msgContent} /> : null}
                <Table style={{ marginTop: '5rem' }} striped celled textAlign="center">
                    <HeaderTable>
                        <Row>
                            <HeaderCell>ID</HeaderCell>
                            <HeaderCell>Description</HeaderCell>
                            <HeaderCell><Icon name="ethereum" />Amount</HeaderCell>
                            <HeaderCell>Recipient</HeaderCell>
                            <HeaderCell>ApprovalsCount</HeaderCell>
                            <HeaderCell>Approve</HeaderCell>
                            <HeaderCell>Finalize</HeaderCell>
                        </Row>
                    </HeaderTable>
                    <Body>
                        {this.renderRow()}
                    </Body>
                </Table>
                <div>Found {requestsCount} requests</div>
            </Layout>
        );
    }
}

export default RequestIndex;