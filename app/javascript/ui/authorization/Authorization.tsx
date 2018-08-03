import * as React from "react";
import { Modal, Typography, withStyles, createStyles, TextField, Button } from "@material-ui/core";

interface OwnProps {
  isOpen: boolean;
  onClose: () => void;
}

interface State {}

interface Props extends OwnProps {
  classes: {
    paper: string;
  }
}

const styles = theme => (createStyles({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));

class Authorization extends React.Component<Props, State> {

  public render(): JSX.Element {
    const { isOpen, onClose, classes } = this.props;
    return (
      <div>
        <Modal
          aria-labelledby="Sign In"
          aria-describedby="Enter credentials"
          open={isOpen}
          onClose={onClose}
        >
          <div className={classes.paper}>
            <Typography variant="title" id="modal-title">
              Please Sign In
            </Typography>
            <TextField
              id="auth-email"
              label="Email"
              name="authEmail"
              placeholder="enter email"
              type="email"
            />
            <TextField
              id="auth-password"
              label="Password"
              name="authPassword"
              placeholder="enter password"
              type="password"
            />
            <Button>Submit</Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withStyles(styles)(Authorization);
