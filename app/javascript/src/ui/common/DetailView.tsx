import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";

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

  private renderInformation = (): JSX.Element => {
    const { information, title, actionButtons } = this.props;
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={10}>
          <Typography gutterBottom variant="title">{title}</Typography>
          <ButtonRow actionButtons={actionButtons} />
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