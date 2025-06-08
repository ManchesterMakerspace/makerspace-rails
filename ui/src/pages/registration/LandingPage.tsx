/**
 * Pre-fetch: 1. InvoiceOptions
 * Show loading while fetching
 */

 import * as React from 'react';
 import useReactRouter from "use-react-router";
 
 import Grid from '@material-ui/core/Grid';
 import Paper from '@material-ui/core/Paper';
 import Button from "@material-ui/core/Button";
 import Typography from '@material-ui/core/Typography';
 import Hidden from "@material-ui/core/Hidden";
 
 import Logo from "../../assets/FilledLaserableLogo.svg";
 
 import { Routing } from "app/constants";
 import { MembershipOptions } from './MembershipOptions';
 import { useGoToSignUp } from "./useGoToSignUp";
import { useMembershipOptions } from 'hooks/useMembershipOptions';
import { AppLoading } from 'components/AppLoading/AppLoading';
 
 const LandingPage: React.FC = () => {
   const { history } = useReactRouter();
   const goToSignIn = () => history.push({ pathname: Routing.Login });
   const goToSignUp = useGoToSignUp();

  const { loading } = useMembershipOptions();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Prefetch membership options with a nicely styled loading display
  if (loading || !mounted) {
    return <AppLoading isLoading={true} />;
  }
 
  return (
    <>
      <Grid container spacing={3} justify="center">
        <Hidden smDown>
          <Grid item lg={6}>
            <Logo style={{ width: "100%", height: "200px" }} alt="Manchester Makerspace" viewBox="0 0 960 580" />
          </Grid>
        </Hidden>

        <Grid item xs={12} md={6}>
          <Paper style={{ minWidth: 275, padding: "1rem" }}>
            <Grid container spacing={3} justify="center">
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Manchester Makerspace is a non-profit collaborative organization of members who maintain a shared
                  workspace, tooling, and skills in the Manchester, NH community. We provide access to shared
                  resources, training, and mentorship for the benefit of Manchester’s local entrepreneurs, makers, and
                  artists of all ages.
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button color="primary" size="large" variant="contained" onClick={() => goToSignUp()}>Sign Up</Button>
              </Grid> 

              <Grid item xs={12}>
                <Button color="primary" variant="outlined" onClick={goToSignIn}>Sign In</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      {/** Below the fold */}
      <Grid container spacing={3} justify="center">
        <Grid item xs={12} style={{ marginTop: "2rem" }}>
          <Typography align="center" variant="h4">Our Membership Options</Typography>
        </Grid>
        <Grid item md={10} xs={12}>
          <MembershipOptions onSelect={goToSignUp} shortForm={false} />
        </Grid>
      </Grid>
    </>
  );
};

export default LandingPage;
 