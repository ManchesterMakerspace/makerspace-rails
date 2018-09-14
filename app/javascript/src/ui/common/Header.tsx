import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem
} from "@material-ui/core";
import {
  Menu as MenuIcon,
} from "@material-ui/icons";

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { logoutUserAction } from "ui/auth/actions";
import { AuthMember } from "ui/auth/interfaces";
import { memberIsAdmin } from "ui/member/utils";

interface OwnProps {}
interface StateProps {
  currentUser: AuthMember;
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

  private renderMenuNavLink = (path: string, label: string) => {
    return (
      <Link to={path} style={{ textDecoration: 'none', color: 'unset' }} onClick={this.detachMenu}>
        <MenuItem>
          {label}
        </MenuItem>
      </Link>
    )
  }

  private renderHambMenu = (): JSX.Element => {
    const { currentUser } = this.props;
    const { anchorEl } = this.state;
    const menuOpen = Boolean(anchorEl);

    return (
      <>
        <IconButton
          className="menu-button"
          color="inherit" aria-label="Menu"
          onClick={this.attachMenu}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
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
          {this.renderMenuNavLink("/members", memberIsAdmin(currentUser) ? "Member Management" : "Members List")}
          {memberIsAdmin(currentUser) && this.renderMenuNavLink("/rentals", "Rental Management")}
          {memberIsAdmin(currentUser) && this.renderMenuNavLink("/subscriptions", "Subscription Management")}
          {memberIsAdmin(currentUser) && this.renderMenuNavLink("/billing", "View Billing Plans")}
          {this.renderMenuNavLink(`/members/${currentUser.id}`, "Profile")}
          <MenuItem onClick={this.logoutUser}>Logout</MenuItem>
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
    const { currentUser } = this.props;

    return (
      <AppBar style={{marginBottom: "1em"}} position="static">
        <Toolbar>
          <Typography variant="title" color="inherit" className="flex">
            Manchester Makerspace
          </Typography>
          { currentUser.id && this.renderHambMenu() }
        </Toolbar>
      </AppBar>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const {
    auth: { currentUser }
  } = state;

  return {
    currentUser,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    logout: () => dispatch(logoutUserAction()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
