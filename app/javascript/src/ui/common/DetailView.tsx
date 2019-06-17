import * as React from "react";
import capitalize from "lodash-es/capitalize";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import LoadingOverlay from "ui/common/LoadingOverlay";

interface Resource {
  name: string;
  displayName?: string;
  content: JSX.Element;
}
interface OwnProps {
  title: string,
  basePath: string,
  information: JSX.Element,
  actionButtons: ActionButton[],
  resources?: Resource[]
  activeResourceName?: string,
}

interface State {
  activeResource: Resource;
}

const sectionBorderStyle = { border: "1px solid black", borderRadius: "3px" }

class DetailView extends React.Component<OwnProps, State> {

  constructor(props: OwnProps) {
    super(props);
    this.state = {
      activeResource: undefined
    };
  }

  public componentDidMount() {
    this.setActiveResourceFromProps();
  }

  public componentDidUpdate(prevProps: OwnProps) {
    const { activeResourceName: prevResourceName, resources: prevResources } = prevProps;
    const { activeResourceName, resources } = this.props;
    if (
      (activeResourceName !== prevResourceName) ||
      (resources !== prevResources)
    ) {
      this.setActiveResourceFromProps();
    }
  }

  private setActiveResourceFromProps = (newActiveName?: string) => {
    const { activeResourceName, resources } = this.props;
    const resourceLookupName = newActiveName || activeResourceName;
    if (this.resourcesExist()) {
      const activeResource = resourceLookupName && resources.find(resource => resource.name === resourceLookupName) || resources[0];
      this.setState({ activeResource });
    }
  }

  private resourcesExist = () => {
    const { resources } = this.props;
    return Array.isArray(resources) && resources.length;
  }

  private renderInformation = (): JSX.Element => {
    const { information, title, actionButtons } = this.props;
    return (
      <>
        <Grid item xs={10}>
          <Typography id="detail-view-title" gutterBottom variant="h6">{title}</Typography>
          <ButtonRow actionButtons={actionButtons} />
        </Grid>
        <Grid item xs={10} style={sectionBorderStyle}>
          {information}
        </Grid>
      </>
    )
  }

  private changeResource = (_event: React.ChangeEvent, value: string) => {
    this.setActiveResourceFromProps(value);
  }

  private renderResources = (): JSX.Element => {
    const { activeResource } = this.state;
    const { resources } = this.props;
    return (
      <Grid item md={10} xs={12} style={{ ...sectionBorderStyle, marginTop: "0.5em"}}>
        {activeResource && (
          <>
            {resources.length > 1 && (<Tabs
              value={activeResource.name}
              indicatorColor="primary"
              textColor="primary"
              style={{marginBottom: "1em"}}
              onChange={this.changeResource}
            >
              {resources.map(resource => {
                return (
                  <Tab
                    id={`${resource.name}-tab`}
                    label={resource.displayName || capitalize(resource.name)}
                    value={resource.name}
                    key={resource.name}
                  />
                );
              })}
            </Tabs>)}
            <div style={{...resources.length > 1 && { marginTop: "0.5em" }}}>
              {activeResource.content}
            </div>
          </>
        ) || <LoadingOverlay id="detail-view"/>}
      </Grid>
    )
  }

  public render(): JSX.Element {
    return (
      <Grid container spacing={24} justify="center">
        {this.renderInformation()}
        {this.resourcesExist() && this.renderResources()}
      </Grid>
    );
  }
}

export default DetailView;