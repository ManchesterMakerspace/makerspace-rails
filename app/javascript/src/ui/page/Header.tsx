import * as React from "react";
import { connect } from "react-redux";

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem
} from "@material-ui/core";
import {
  Menu as MenuIcon,
} from "@material-ui/icons";

import Login from "ui/auth/Login";
import { StateProps as ReduxState } from "ui/reducer";
import { logoutUserAction, activeSessionLogin } from "ui/auth/actions";

interface StateProps {
  auth: boolean;
}

interface OwnProps {}
interface DispatchProps {
  logout: () => void;
  attemptLogin: () => void;
}

interface Props extends StateProps, OwnProps, DispatchProps {}

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

  public componentDidMount() {
    this.props.attemptLogin();
  }

  private openSignIn = () => {
    this.setState({ authOpen: true });
  }
  private closeSignIn = () => {
    this.setState({ authOpen: false });
  }

  private attachMenu = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  private detachMenu = () => {
    this.setState({ anchorEl: null });
  };

  private renderHambMenu = (): JSX.Element => {
    const { logout } = this.props;
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
          <MenuItem onClick={this.detachMenu}>Profile</MenuItem>
          <MenuItem onClick={this.detachMenu}>My account</MenuItem>
          <MenuItem onClick={logout && this.detachMenu}>Logout</MenuItem>
        </Menu>
      </>
    )
  }
  
  public render(): JSX.Element {
    const { auth } = this.props;
    const { authOpen } = this.state;

    return (
      <div className="root">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit" className="flex">
              Manchester Makerspace
            </Typography>
            {
              auth ?
                this.renderHambMenu()
              : <Button color="inherit" onClick={this.openSignIn}>
                  Login
                </Button>
            }
          </Toolbar>
        </AppBar>
        <Login 
          isOpen={authOpen}
          onClose={this.closeSignIn}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: ReduxState, ownProps: Props): StateProps => {
  const {
    auth: {
      currentUser
    }
  } = state;

  return {
    auth: currentUser && !!currentUser.email
  }
}

const mapDispatchToProps = (
  dispatch
): DispatchProps => {
  return {
    logout: () => dispatch(logoutUserAction()),
    attemptLogin: () => dispatch(activeSessionLogin())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)