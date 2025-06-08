import * as React from "react";
import capitalize from "lodash-es/capitalize";
import useReactRouter from "use-react-router";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
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
  actionButtons: JSX.Element[],
  resources?: Resource[]
  activeResourceName?: string,
}

interface State {
  activeResource: Resource;
}

const sectionBorderStyle = { border: "1px solid black", borderRadius: "3px" }

const DetailView: React.FC<OwnProps> = ({
  activeResourceName,
  resources,
  title,
  actionButtons,
  information,
}) => {
  const resourcesExist = Array.isArray(resources) && !!resources.length;
  const [activeResource, setActiveResource] = React.useState<Resource>(resourcesExist ? resources[0] : undefined);
  const { match: { params: { resource }}, history, location: { pathname } } = useReactRouter();

  React.useEffect(() => {
    resource && changeResource(resource);
  }, [resource]);

  const changeResource = React.useCallback((newActiveName?: string) => {
    const resourceLookupName = newActiveName || activeResourceName;
    if (resourcesExist) {
      const newResource = resourceLookupName && resources.find(resource => resource.name === resourceLookupName) || resources[0];
      if (newResource) {
        setActiveResource(newResource);
        if (resource !== newResource.name) {
          const hasSubpath = resources.some(resource => pathname.endsWith(`/${resource.name}`));
          const newPath = hasSubpath ? pathname.replace(/\/[^\/]*$/, `/${newResource.name}`) : `${pathname}/${newResource.name}`;
          history.push(newPath);
        }        
      }
    }
  }, [activeResourceName, resources]);

  const onTabChange = React.useCallback((_: React.ChangeEvent<{}>, value: string) => {
    changeResource(value);
  }, [changeResource]);

  return (
    <Grid container spacing={3} justify="center">
      <Grid item md={10} xs={12}>
        <Typography id="detail-view-title" gutterBottom variant="h6">{title}</Typography>
        {actionButtons}
      </Grid>
      <Grid item md={10} xs={12} style={sectionBorderStyle}>
        {information}
      </Grid>
      {resourcesExist && (
        <Grid item md={10} xs={12} style={{ ...sectionBorderStyle, marginTop: "0.5em"}}>
        {activeResource && (
          <>
            {resources.length > 1 && (<Tabs
              value={activeResource.name}
              indicatorColor="primary"
              textColor="primary"
              style={{marginBottom: "1em"}}
              onChange={onTabChange}
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
      )}
    </Grid>
  );
};

export default DetailView;