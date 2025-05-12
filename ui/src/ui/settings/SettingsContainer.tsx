import * as React from "react";

import useReactRouter from "use-react-router";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import { Whitelists } from "app/constants";
import { useAuthState } from "../reducer/hooks";
import EditMember from "ui/member/EditMember";
import { getMember, Member } from "makerspace-ts-api-client";
import useReadTransaction from "ui/hooks/useReadTransaction";
import LoadingOverlay from "ui/common/LoadingOverlay";
import SubscriptionSettings from "ui/settings/SubscriptionSettings";
import useSubresourcePath from "ui/hooks/useSubresourcePath";
import { useDispatch } from "react-redux";
import { loginUserAction } from "ui/auth/actions";

export enum SubRoutes {
  Profile = "profile",
  Subscriptions = "subscriptions",
  PaymentMethods = "payment-methods",
}

const SettingsContainer: React.FC = () => {
  const { currentUser: { id: currentUserId }, permissions } = useAuthState();
  const billingEnabled = !!permissions[Whitelists.billing];
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(loginUserAction());
  }, [dispatch]);

  const [selectedIndex, setIndex] = React.useState(0);
  const {
    isRequesting: loadingMember,
    data: member = { id: currentUserId } as Member,
  } = useReadTransaction(getMember, { id: currentUserId });

  const { match: { params: { resource }} } = useReactRouter<{ resource: string }>();
  const changeResource = useSubresourcePath(Object.values(SubRoutes));
  React.useEffect(() => {
    switch(resource) {
      case SubRoutes.Subscriptions:
        setIndex(1);
        break;
      case SubRoutes.PaymentMethods:
        setIndex(2);
        break;
      default:
        setIndex(0);
    }
  }, [resource]);

  const onSelectItem = React.useCallback((index: number, route: string) => () => {
    setIndex(index);
    changeResource(route);
  }, [setIndex, changeResource]);

  return (
    <Grid container spacing={2}>
      <Grid item md={4} sm={5} xs={12}>
        <List component="nav">
          <ListItem button selected={selectedIndex === 0} onClick={onSelectItem(0, "profile")}>
            <ListItemText id="settings-profile" primary="Personal Information" />
          </ListItem>
          {billingEnabled && (
            <>
              <ListItem button selected={selectedIndex === 1} onClick={onSelectItem(1, "subscriptions")}>
                <ListItemText id="settings-membership" primary="Subscriptions" />
              </ListItem>
              <ListItem button selected={selectedIndex === 2} onClick={onSelectItem(2, "payment-methods")}>
                <ListItemText id="settings-payment-methods" primary="Payment Methods" />
              </ListItem>
            </>
          )}
        </List>
      </Grid>
      <Grid item md={8} sm={7} xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {selectedIndex === 0 && (
                  <>
                    {loadingMember && <LoadingOverlay id="settings-loading" />}
                    <EditMember formOnly={true} member={member} />
                  </>
                )}
                {selectedIndex === 1 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <SubscriptionSettings />
                    </Grid>
                  </Grid>
                )}
                {selectedIndex === 2 && (
                  <PaymentMethodsContainer title="Manage Payment Methods" managingMethods={true} />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SettingsContainer;
