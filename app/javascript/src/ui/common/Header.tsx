import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MenuIcon from "@material-ui/icons/Menu";

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { logoutUserAction } from "ui/auth/actions";
import { AuthMember } from "ui/auth/interfaces";
import { memberIsAdmin } from "ui/member/utils";
import { Routing } from "app/constants";
import { Location } from "history";

interface OwnProps {
  location: Location<any>;
}
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
    const match = this.props.location && this.props.location.pathname === path;
    return (
      <Link to={path} style={{ outline: 'none',textDecoration: 'none', color: 'unset' }} onClick={this.detachMenu}>
        <MenuItem selected={match}>
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
          {this.renderMenuNavLink(Routing.Profile.replace(Routing.PathPlaceholder.MemberId, currentUser.id), "Profile")}
          {this.renderMenuNavLink(Routing.Members, memberIsAdmin(currentUser) ? "Member Management" : "Members List")}
          {memberIsAdmin(currentUser) && this.renderMenuNavLink(Routing.Rentals, "Rental Management")}
          {memberIsAdmin(currentUser) && this.renderMenuNavLink(Routing.Subscriptions, "Subscription Management")}
          {memberIsAdmin(currentUser) && this.renderMenuNavLink(Routing.Billing, "View Billing Plans")}
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
