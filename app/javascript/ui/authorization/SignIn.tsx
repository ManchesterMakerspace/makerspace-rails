import * as React from "react";
import { Modal, Typography, withStyles, createStyles } from "@material-ui/core";

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

const rand = () => {
  return Math.round(Math.random() * 20) - 10;
}

const getModalStyle = () => {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const styles = theme => (createStyles({
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
  },
}));

class SignIn extends React.Component<Props, State> {

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
          <div style={getModalStyle()} className={classes.paper}>
            <Typography variant="title" id="modal-title">
              Text in a modal
            </Typography>
            <Typography variant="subheading" id="simple-modal-description">
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
            </Typography>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withStyles(styles)(SignIn);
