import * as React from "react";
import { Grid, Typography, Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";

interface ActionButton {
  color: ButtonProps["color"];
  variant: ButtonProps["variant"];
  disabled: boolean;
  onClick: () => void;
  label: string;
}
interface Resource {
  name: string;
  displayName?: string;
  content: string | JSX.Element;
}
interface OwnProps {
  title: string,
  basePath: string,
  information: JSX.Element,
  actionButtons: ActionButton[],
  resources?: Resource[]
  activeResourceName?: string,
}

class DetailView extends React.Component<OwnProps, {}> {

  private renderActionButtons = (): JSX.Element | JSX.Element[] => {
    const { actionButtons } = this.props;
    return actionButtons.map((action) => {
      return (
        <Button
          style={{ marginRight: ".25em" }}
          color={action.color}
          variant={action.variant}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )
    })
  }

  private renderInformation = (): JSX.Element => {
    const { information, title } = this.props;

    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={10}>
          <Typography gutterBottom variant="title">{title}</Typography>
          {this.renderActionButtons()}
        </Grid>
        <Grid item xs={10} style={{ border: "1px solid black", borderRadius: "3px" }}>
          {information}
        </Grid>
      </Grid>
    )
  }

  public render(): JSX.Element {
    return (
      this.renderInformation()
    );
  }
}

export default DetailView;