import * as React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";

import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { CollectionOf } from "app/interfaces";
import { Transaction } from "app/entities/transaction";
import { Invoice } from "app/entities/invoice";
import { isEmpty } from "lodash-es";
import { buildProfileRouting } from "ui/member/utils";
import { Routing } from "app/constants";


interface DispatchProps {
  pushLocation: (location: string) => void;
}
interface StateProps {
  transactions: CollectionOf<Transaction>;
  invoices: CollectionOf<Invoice>;
  userId: string;
}
interface OwnProps {}
type Props = DispatchProps & StateProps & OwnProps;

class Receipt extends React.Component<Props> {

  public componentDidMount(): void {
    const { transactions, userId } = this.props;
    if (isEmpty(transactions)) {
    const redirectPath = userId ? buildProfileRouting(userId) : Routing.Login;
    this.props.pushLocation(redirectPath);
    }
  }

  private renderSubscriptionReceipt = (transaction: Transaction) => {
    return (
      "SUB"
    );
  }

  private renderGeneralReceipt = (transaction: Transaction) => {
    return (
      "General"
    );
  }

  public render(): JSX.Element {
    const { transactions } = this.props;

    return (
      <>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Typography variant="h4">Thank you for your purchase!</Typography>
          <Typography variant="subheading">Please review the below transactions</Typography>
        </Grid>
      </Grid>
      {(Object.values(transactions).map(transaction => (
        <Card style={{ height: "100%" }}>
          <CardContent>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                {transaction.planId ? this.renderSubscriptionReceipt(transaction) : this.renderGeneralReceipt(transaction)}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )))}
      </>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const { transactions, invoices } = state.checkout;
  const { currentUser: { id: userId } } = state.auth;
  return {
    invoices,
    transactions,
    userId,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    pushLocation: (location) => dispatch(push(location))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Receipt);