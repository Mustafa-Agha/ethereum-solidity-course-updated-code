import React, { Component } from "react";
import ErrorPage from "next/error";
import { Card, Button, Divider, Message } from "semantic-ui-react";
import { Link } from "@routes";
import Layout from "@layouts";
import { Header } from "@elements";
import { ContributeForm } from "@templates";
import { Campaign, web3 } from "@ethereum";

class Show extends Component {
    static async getInitialProps({ query }) {
        try {
            const address = query.address;
            const campaign = Campaign(address);
            const details = await campaign.methods.getCampaignDetails().call();
            const {
                0: mc, // minimumContribution
                1: cb, // campaignBalance
                2: rc, // requestsCount
                3: ac, // approversCount
                4: ma  // managerAddress
            } = details;

            return { mc, cb, rc, ac, ma, ca: address }; // ca = Contract Address;
        } catch(err) {
            return { err };
        }
    }

    state = {
        success: false,
        error: false,
        msgHeader: '',
        msgContent: ''
    };

    renderCards = () => {
        const { mc, cb, rc, ac, ma } = this.props;
        const items = [
            {
              header: <span
                className="header"
                style={{
                    whiteSpace: 'nowrap',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>{ma}</span>,
              description:
                'The Manager created this campaign, and can create requests to withdraw money.',
              meta: 'Address of Manager',
            },
            {
                header: mc,
                description:
                  'You must contribute at least ' + mc + ' (wei) to become an approver.',
                meta: 'Minimum Contribution (wei)',
            },
            {
                header: rc,
                description:
                  'A request tries to withdraw money from a contract. Request must be approved by approvers.',
                meta: 'Number of Requests',
            },
            {
                header: ac,
                description:
                  'Number of people who have already donated for this campaign.',
                meta: 'Number of Approvers',
            },
            {
                header: web3.utils.fromWei(cb, 'ether'),
                description: 'The Balance is how much money this campaign has left to sepnd.',
                meta: 'Campaign Balance (eth)'
            },
            {
                meta: <span style={{ marginBottom: '3px', textTransform: 'uppercase' }} className="meta">Contribute to this campaign</span>,
                description: this.renderContribute()
            }
        ];

        return <Card.Group centered items={items} />
    }

    renderContribute = () => {
        const { mc, ca } = this.props;
        return(<ContributeForm updateMsgs={this.handleUpdateMsgs} showMsgs={false} style={{ textAlign: 'center', marginTop: '4px' }}  mc={mc} ca={ca} />);
    }

    handleUpdateMsgs = (msgObj) => {
        const { success, error, msgHeader, msgContent } = msgObj;
        this.setState({ success, error, msgHeader, msgContent });
    }

    render() {
        const { rc, ca, err } = this.props;
        const { success, error, msgHeader, msgContent } = this.state;

        if (err) {
            // ERROR HANDLING IF QUERY IS WRONGLY ENTERED
            return  <ErrorPage statusCode={404} />
        }

        return(
            <Layout>
                <Header text="Campaign Details" divider />
                {this.renderCards()}
                <Divider />
                {success ? <Message style={{ textAlign: 'center' }} success={success} header={msgHeader} content={msgContent} /> : null}
                {error ? <Message style={{ textAlign: 'center' }} error={error} header={msgHeader} content={msgContent} /> : null}
                <Header style={{ marginTop: '5rem' }} text="Campaign Requests" divider />
                <Link route={`/campaigns/${ca}/requests`}>
                    <a>
                        <Button
                            style={{ display: 'flex', justifyContent: 'center' }}
                            color='red'
                            content='View Requests'
                            icon='bullhorn'
                            label={{ basic: true, color: 'red', pointing: 'left', content: rc }}
                        />
                    </a>
                </Link>
            </Layout>
        );
    }
}

export default Show;