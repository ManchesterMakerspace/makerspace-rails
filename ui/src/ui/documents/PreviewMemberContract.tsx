import * as React from "react";
import Grid from "@material-ui/core/Grid";
import { Link } from "@material-ui/core";
import { Documents, documents } from "./Document";

const PreviewMemberContract: React.FC  = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <Link target="_blank" href={String(documents[Documents.MemberContract].src) + "?saved=true"}>View Member Contract</Link>
      </Grid>
    </Grid>
  )
}

export default PreviewMemberContract;
