import * as React from "react";
import { connect } from "react-redux";

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  withStyles,
  Menu,
  MenuItem
} from "@material-ui/core";
import {
  Menu as MenuIcon,
} from "@material-ui/icons";

import Login from "ui/auth/Login";
import { StateProps as ReduxState } from "ui/reducer";

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

interface StateProps {
  auth: boolean;
}

interface OwnProps {
  classes: {
    root: string;
    flex: string;
    menuButton: string;
  }
}

interface Props extends StateProps, OwnProps {

}

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
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const menuOpen = Boolean(anchorEl);

    return (
      <>
        <IconButton 
          className={classes.menuButton} 
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
        </Menu>
      </>
    )
  }
  
  public render(): JSX.Element {
    const { classes, auth } = this.props;
    const { authOpen } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit" className={classes.flex}>
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
      email
    }
  } = state;

  return {
    auth: !!email
  }
}

const styledHeader = withStyles(styles)(Header);
export default connect(mapStateToProps)(styledHeader)