import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { Grid, Card, CardContent, Typography } from "@material-ui/core";

import { Invoice } from "app/entities/invoice";
import { CollectionOf } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import CheckoutForm from "ui/checkout/CheckoutForm";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { timeToDate } from "ui/utils/timeToDate";
import { numberAsCurrency } from "ui/utils/numberToCurrency";
import { Routing } from "app/constants";
import { isEmpty } from "lodash-es";

interface OwnProps {}
interface StateProps {
  invoices: CollectionOf<Invoice>;
  auth: string;
}
interface DispatchProps {}
interface Props extends OwnProps, StateProps, DispatchProps {}
interface State {
  total: number;
  redirect: string;
}
class CheckoutContainer extends React.Component<Props,State>{
  constructor(props: Props){
    super(props);
    // Redirect if there are no invoices to checkout
    const { auth, invoices } = props;
    const redirectPath = auth ? Routing.Profile.replace(Routing.PathPlaceholder.MemberId, auth) : Routing.Login;
    const redirect = invoices && isEmpty(invoices) ? redirectPath : undefined;
    this.state = ({ 
      redirect,
      total: this.props.invoices && Object.values(invoices).reduce((a, b) => a + Number(b.amount), 0)
    });
  }
  
  private fields: Column<Invoice>[] = [
    {
      id: "description",
      label: "Description",
      cell: (row: Invoice) => row.description,
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: Invoice) => numberAsCurrency(row.amount),
    },
  ];

  private renderTotal = () => { 
    const { invoices } = this.props;
    const { total } = this.state;
    return (
      <Card style={{height: "100%"}}>
        <CardContent>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <TableContainer
                id="checkout-invoices-table"
                title="Dues"
                data={Object.values(invoices)}
                totalItems={Object.values(invoices).length}
                columns={this.fields}
                rowId={this.rowId}
              />
            </Grid>
            <Grid item xs={12} style={{textAlign: "right"}}>
              <Typography variant="title" color="inherit">Total {numberAsCurrency(total)}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  private rowId = (row: Invoice) => row.id;
  public render(): JSX.Element {
    const { redirect } = this.state;

    if (redirect) {
      return <Redirect to={redirect}/>
    }
    return (
      <Grid container spacing={16}>
        <Grid item md={8} sm={7} xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <Card style={{minWidth: 275}}>
                <CardContent>
                  
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <CheckoutForm/>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>


        <Grid item md={4} sm={5} xs={12}>
          {this.renderTotal()}
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const { invoices } = state.checkout;
  const { currentUser: { id: userId } } = state.auth;
  return {
    invoices,
    auth: userId
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutContainer);