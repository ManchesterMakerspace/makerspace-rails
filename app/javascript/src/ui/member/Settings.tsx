import * as React from "react";
import { connect } from "react-redux";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { CrudOperation } from "app/constants";
import UpdateMemberContainer, { UpdateMemberRenderProps } from "ui/member/UpdateMemberContainer";
import MemberForm from "ui/member/MemberForm";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import { AuthMember } from "ui/auth/interfaces";
import UpdateMembershipForm from "ui/membership/UpdateMembershipForm";
import { Whitelists } from "app/constants";
import { readMemberAction } from "ui/member/actions";
import { MemberDetails } from "app/entities/member";
import { withRouter, RouteComponentProps } from "react-router";

interface StateProps {
  currentMember: AuthMember;
  member: MemberDetails;
  isReading: boolean;
  readError: string;
  billingEnabled: boolean;
}

interface DispatchProps {
  getMember: (id: string) => void;
}
interface OwnProps extends RouteComponentProps<{}>{ }
interface State {
  selectedIndex: number;
}

interface Props extends StateProps, OwnProps {
  getMember: () => void;
}

class SettingsContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIndex: 0,
    };
  }

  public componentDidMount() {
    this.props.getMember();
  }

  private toggleSettingsView = (_event: any, index: number) => this.setState({ selectedIndex: index });

  private renderForm = () => {
    const { selectedIndex } = this.state;
    const { member, billingEnabled, isReading, readError } = this.props;
    let form: JSX.Element;
    if (!member) {
      return;
    }
    const memberForm = (renderProps: UpdateMemberRenderProps) => (
      <MemberForm
        ref={renderProps.setRef}
        member={member}
        isAdmin={false}
        isOpen={renderProps.isOpen}
        isRequesting={isReading || renderProps.isRequesting}
        error={readError || renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        noDialog={true}
        title="Update Profile Details"
      />
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
    } else if (selectedIndex === 1 && billingEnabled) {
      form = <UpdateMembershipForm subscriptionId={member.subscriptionId} member={member}/>;
    } else if (selectedIndex === 2 && billingEnabled) {
      form = (<PaymentMethodsContainer
        title="Manage Payment Methods"
        managingMethods={true}
      />)
    }

    return form;
  }

  private renderSideNav = () => {
    const { billingEnabled } = this.props;
    return (
      <List component="nav">
        <ListItem
          button
          selected={this.state.selectedIndex === 0}
          onClick={event => this.toggleSettingsView(event, 0)}
        >
          {/* <ListItemIcon>
          </ListItemIcon> */}
          <ListItemText 
            id="settings-profile"
            primary="Profile Details" 
          />
        </ListItem>
        {billingEnabled && <>
          <ListItem
            button
            selected={this.state.selectedIndex === 1}
            onClick={event => this.toggleSettingsView(event, 1)}
          >
            {/* <ListItemIcon>
            </ListItemIcon> */}
            <ListItemText 
              id="settings-membership"
              primary="Membership" 
            />
          </ListItem>
          <ListItem
            button
            selected={this.state.selectedIndex === 2}
            onClick={event => this.toggleSettingsView(event, 2)}
          >
            {/* <ListItemIcon>
            </ListItemIcon> */}
            <ListItemText 
              id="settings-payment-methods"
              primary="Payment Methods" 
            />
          </ListItem>
        </>}
      </List>
    )
  }

  public render(): JSX.Element {
    return (
      <Grid container spacing={16}>
        <Grid item md={4} sm={5} xs={12}>
          {this.renderSideNav()}
        </Grid>
        <Grid item md={8} sm={7} xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={16}>
                  <Grid item xs={12}>
                    {this.renderForm()}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
        </Grid>
      </Grid>
    )
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
): DispatchProps => {
  return {
    getMember: (id) => dispatch(readMemberAction(id))
  }
};

const mapStateToProps = (
  state: ReduxState
): StateProps => {
  const { currentUser: currentMember, permissions } = state.auth;
  const { entity: member, read: { isRequesting, error } } = state.member;
  return {
    currentMember,
    member,
    isReading: isRequesting,
    readError: error,
    billingEnabled: !!permissions[Whitelists.billing] || false,
  }
}

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps,
): Props => {

  return {
    ...stateProps,
    ...ownProps,
    getMember: () => dispatchProps.getMember(stateProps.currentMember && stateProps.currentMember.id),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps, mergeProps)(SettingsContainer));
