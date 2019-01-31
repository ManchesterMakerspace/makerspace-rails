import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { Routing, CrudOperation } from "app/constants";
import UpdateMemberContainer, { UpdateMemberRenderProps } from "ui/member/UpdateMemberContainer";
import MemberForm from "ui/member/MemberForm";
import { State as ReduxState } from "ui/reducer";
import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import { AuthMember } from "ui/auth/interfaces";
import UpdateMembershipForm from "ui/member/UpdateMembershipForm";
import { Whitelists } from "app/constants";
const { billingEnabled } = Whitelists;

interface StateProps {
  member: AuthMember;
  isAdmin: boolean;
}

interface State {
  selectedIndex: number;
  paymentMethodId: string;
}

class SettingsContainer extends React.Component<StateProps, State> {
  constructor(props: StateProps) {
    super(props);
    this.state = {
      selectedIndex: 0,
      paymentMethodId: undefined,
    };
  }

  private toggleSettingsView = (_event: any, index: number) => this.setState({ selectedIndex: index });

  private selectPaymentMethod = (paymentMethodId: string) => this.setState({ paymentMethodId });

  private renderForm = () => {
    const { selectedIndex, paymentMethodId } = this.state;
    const { member } = this.props;
    let form: JSX.Element;
    if (!member) {
      return;
    }
    const memberForm = (renderProps: UpdateMemberRenderProps) => (
      <>
        <MemberForm
          ref={renderProps.setRef}
          member={renderProps.member}
          isAdmin={false}
          isOpen={renderProps.isOpen}
          isRequesting={renderProps.isUpdating}
          error={renderProps.updateError}
          onClose={renderProps.closeHandler}
          onSubmit={renderProps.submit}
          noDialog={true}
          title="Update Profile Details"
        />
      </>
    )
    if (selectedIndex === 0) {
      form = (
        <UpdateMemberContainer
          closeHandler={() => {}}
          operation={CrudOperation.Update}
          isOpen={selectedIndex === 0}
          member={member}
          render={memberForm}
        />
      )
    } else if (selectedIndex === 1) {
      form = <UpdateMembershipForm subscriptionId={member.subscriptionId} member={member}/>;
    } else if (selectedIndex === 2) {
      form = (<PaymentMethodsContainer
        onPaymentMethodChange={this.selectPaymentMethod}
        selectedPaymentMethodId={paymentMethodId}
        title="Manage Payment Methods"
        managingMethods={true}
      />)
    }

    return form;
  }

  private renderSideNav = () => {
    return (
      <List component="nav">
        <ListItem
          button
          selected={this.state.selectedIndex === 0}
          onClick={event => this.toggleSettingsView(event, 0)}
        >
          {/* <ListItemIcon>
          </ListItemIcon> */}
          <ListItemText primary="Profile Details" />
        </ListItem>
        {billingEnabled && <>
          <ListItem
            button
            selected={this.state.selectedIndex === 1}
            onClick={event => this.toggleSettingsView(event, 1)}
          >
            {/* <ListItemIcon>
            </ListItemIcon> */}
            <ListItemText primary="Membership" />
          </ListItem>
          <ListItem
            button
            selected={this.state.selectedIndex === 2}
            onClick={event => this.toggleSettingsView(event, 2)}
          >
            {/* <ListItemIcon>
            </ListItemIcon> */}
            <ListItemText primary="Payment Methods" />
          </ListItem>
        </>}
      </List>
    )
  }

  public render(): JSX.Element {
    const { member } = this.props;
    return (
      <Grid container spacing={16}>
        <Grid item md={4} sm={5} xs={12}>
          {this.renderSideNav()}
        </Grid>
        <Grid item md={8} sm={7} xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={16}>
                    <Grid item xs={12}>
                      <Button
                        style={{float: "right"}}
                        color="default"
                        variant="contained"
                      >
                        <Link
                          to={Routing.Profile.replace(Routing.PathPlaceholder.MemberId, member.id)}
                          style={{ outline: 'none', textDecoration: 'none', color: 'unset' }}
                        >
                          Go to Profile
                        </Link>
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      {this.renderForm()}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = (
  state: ReduxState
): StateProps => {
  const { currentUser } = state.auth;
  return {
    member: currentUser,
    isAdmin: currentUser.isAdmin,
  }
}

export default connect(mapStateToProps)(SettingsContainer);
