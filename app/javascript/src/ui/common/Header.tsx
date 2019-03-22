import * as React from "react";
import { Link } from "react-router-dom";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MenuIcon from "@material-ui/icons/Menu";

const Logo = require("images/FilledLaserableLogo.svg");

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { logoutUserAction } from "ui/auth/actions";
import { AuthMember } from "ui/auth/interfaces";
import { memberIsAdmin } from "ui/member/utils";
import { Routing, Whitelists } from "app/constants";

interface OwnProps extends RouteComponentProps<any> {
}
interface StateProps {
  currentUser: AuthMember;
  authRequesting: boolean;
  billingEnabled: boolean;
  earnedMembershipEnabled: boolean;
}
interface DispatchProps {
  logout: () => void;
}

interface Props extends OwnProps, StateProps, DispatchProps {}

interface State {
  authOpen: boolean;
  anchorEl: HTMLElement;
}

class Header extends React.Component<Props, State> {

  constructor(props: Props){
    super(props)
    this.state = {
      authOpen: false,
      anchorEl: null,
    };
  }

  private attachMenu = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  private detachMenu = () => {
    this.setState({ anchorEl: null });
  };

  private renderMenuNavLink = (path: string, label: string, id: string) => {
    const match = this.props.location && this.props.location.pathname === path;
    return (
      <Link id={id} to={path} style={{ outline: 'none',textDecoration: 'none', color: 'unset' }} onClick={this.detachMenu}>
        <MenuItem selected={match}>
          {label}
        </MenuItem>
      </Link>
    )
  }

  private renderLoginLink = () => {
    return (
      <Link to={Routing.Login} style={{ outline: 'none', textDecoration: 'none', color: 'unset' }}>
        <MenuItem component={Typography}>
          Already a member? Login
        </MenuItem>
      </Link>
    )
  }

  private renderHambMenu = (): JSX.Element => {
    const { currentUser, billingEnabled, earnedMembershipEnabled } = this.props;
    const { anchorEl } = this.state;
    const menuOpen = Boolean(anchorEl);
    const profileUrl = Routing.Profile.replace(Routing.PathPlaceholder.MemberId, currentUser.id);

    return (
      <>
      <Typography variant="body1" color="secondary">
        {currentUser.firstname}
      </Typography>
        <IconButton
          id="menu-button"
          className="menu-button"
          color="inherit" aria-label="Menu"
          onClick={this.attachMenu}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          transitionDuration={0}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={menuOpen}
          onClose={this.detachMenu}
        >
          {this.renderMenuNavLink(profileUrl, "My Profile", "profile")}
          {this.renderMenuNavLink(Routing.Members, "Members", "members")}
          {memberIsAdmin(currentUser) && this.renderMenuNavLink(Routing.Rentals, "Rentals", "rentals")}
          {billingEnabled && memberIsAdmin(currentUser) && this.renderMenuNavLink(Routing.Billing, "Billing", "billing")}
          {earnedMembershipEnabled && this.renderMenuNavLink(Routing.EarnedMemberships, "Earned Memberships", "earnedMembership")}
          {this.renderMenuNavLink(Routing.Settings, "Account Settings", "settings")}
          <MenuItem id="logout" onClick={this.logoutUser}>Logout</MenuItem>
        </Menu>
      </>
    )
  }

  private logoutUser = () => {
    const { logout } = this.props;
    logout();
    this.detachMenu();
  }

  public render(): JSX.Element {
    const { currentUser, authRequesting } = this.props;
    return (
      <AppBar style={{ marginBottom: "1em" }} position="static" color="default" title={Logo}>
        <Toolbar>
          <Typography variant="h6" color="inherit" className="flex">
            <img src={Logo} alt="Manchester Makerspace" height={60} />
          </Typography>
          {currentUser.id ? this.renderHambMenu() : (!authRequesting && this.renderLoginLink()) }
        </Toolbar>
      </AppBar>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const {
    auth: { currentUser, isRequesting, permissions }
  } = state;

  return {
    currentUser,
    billingEnabled: !!permissions[Whitelists.billing] || false,
    earnedMembershipEnabled: memberIsAdmin(currentUser) && !!permissions[Whitelists.earnedMembership] || false,
    authRequesting: isRequesting
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    logout: () => dispatch(logoutUserAction()),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
