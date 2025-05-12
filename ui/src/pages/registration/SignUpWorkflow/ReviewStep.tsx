import * as React from "react";
import useReactRouter from "use-react-router";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { paymentMethodQueryParam } from "../PaymentMethods";
import { discountParam, invoiceOptionParam, ssmDiscount } from "../MembershipOptions";
import { useSearchQuery } from "hooks/useSearchQuery";
import { useAuthState } from "ui/reducer/hooks";
import { useMembershipOptions } from "hooks/useMembershipOptions";
import Typography from "@material-ui/core/Typography";
import { buildProfileRouting, buildNewMemberProfileRoute } from "ui/member/utils";
import { MembershipPreview } from "./CartPreview";
import { CheckboxInput } from "components/Form/inputs/CheckboxInput";
import { useSignUpContext } from "./SignUpContext";
import useReadTransaction from "ui/hooks/useReadTransaction";
import { createTransaction, getPaymentMethod, isApiErrorResponse, Transaction } from "makerspace-ts-api-client";
import LoadingOverlay from "ui/common/LoadingOverlay";
import ErrorMessage from "ui/common/ErrorMessage";
import PaymentMethodComponent from "ui/checkout/PaymentMethod";
import { Form } from "components/Form/Form";
import useWriteTransaction, { SuccessTransactionState } from "ui/hooks/useWriteTransaction";
import { ToastStatus, useToastContext } from "components/Toast/Toast";
import { Routing } from "app/constants";
import { useTotal } from "./constant";

interface Props {}

const checkboxField = {
  id: "authorization-agreement-checkbox",
  name: "authorization-agreement-checkbox",
  label: "I agree",
};

// TODO: Support plain invoices

type TransactionResponse = SuccessTransactionState<Parameters<typeof createTransaction>[0], Transaction>;

export const ReviewStep: React.FC<Props> = ({ children }) => {
  const { currentUser } = useAuthState();
  const { create } = useToastContext();
  const { setActiveStep } = useSignUpContext();
  const { history } = useReactRouter();
  const { current: isNewMember } = React.useRef(!currentUser.memberContractOnFile);

  const onSuccess = React.useCallback(({ response: { data: transaction } }: TransactionResponse) => {
    const url = isNewMember ? buildNewMemberProfileRoute(currentUser.id) : buildProfileRouting(currentUser.id);

    const invoiceId = transaction?.invoice?.id;
    create({
      status: ToastStatus.Success,
      message: (
        <>
          <Typography component="span" variant="body1">Payment Successful!</Typography>
          {!!invoiceId && (
            <Link
              style={{ marginLeft: "1em" }}
              href={Routing.Receipt.replace(Routing.PathPlaceholder.InvoiceId, invoiceId)}
              target="_blank"
            >
              <Typography component="span" variant="body1">View Receipt</Typography>
            </Link>
          )}
        </>
      )
    });

    history.push(url);
  }, [create, history, currentUser.id, isNewMember]);

  const { call, isRequesting: submitting, error: paymentError, } = useWriteTransaction(createTransaction, onSuccess);

  const {
    invoiceOptionId: invoiceOptionIdParam,
    discountId: discountIdParam,
    paymentMethodId: paymentMethodIdParam
  } = useSearchQuery({
    invoiceOptionId: invoiceOptionParam,
    discountId: discountParam,
    paymentMethodId: paymentMethodQueryParam
  });
  const { allOptions, discounts } = useMembershipOptions(true);
  const discountId = discountIdParam === ssmDiscount ?
    allOptions.find(opt => opt.id === invoiceOptionIdParam)?.discountId : discountIdParam;

  const onSubmit = React.useCallback(async () => {
    await call({
      body: {
        discountId,
        invoiceOptionId: invoiceOptionIdParam,
        paymentMethodId: paymentMethodIdParam
      }
    });
  }, [
    call,
    invoiceOptionIdParam,
    discountId,
    paymentMethodIdParam,
    discounts,
  ]);

  React.useEffect(() => {
    paymentError && document.getElementById("review-checkout-error")?.scrollIntoView(true);
  }, [paymentError]);

  const selectedOpt = allOptions.find(opt => opt.id === invoiceOptionIdParam);
  const total = useTotal(Number(selectedOpt?.amount), discountIdParam)
  const { response, isRequesting, error } = useReadTransaction(getPaymentMethod, { id: paymentMethodIdParam }, !paymentMethodIdParam);
  const paymentMethod = !isApiErrorResponse(response) && response?.data;

  return (
    <Grid container spacing={5} justify="center">
      <Grid item xs={12}>
        <Form
          onSubmit={onSubmit}
          loading={submitting}
          error={paymentError}
          hideFooter={true}
          id="review-checkout"
        >
          <Grid container spacing={5} justify="center">
            <Grid item xs={12}>
              <Paper>
                <Grid item xs={12} style={{ backgroundColor: "#F6F6F6", marginBottom: "1rem" }}>
                  <Grid container spacing={2} justify="center">
                    <Grid item xs={11}>
                      <Box display="flex">
                        <Typography style={{ flexGrow: 1 }} variant="h4">
                          Member Info
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid container spacing={2} justify="center">
                  <Grid item xs={11}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {currentUser.firstname} {currentUser.lastname}
                    </Typography>
                  </Grid>
                  <Grid item xs={11}>
                    <Typography variant="body1">
                      <strong>Email / Username:</strong> {currentUser.email}
                    </Typography>
                  </Grid>

                  {currentUser.address && (
                    <Grid item xs={11}>
                      <Typography variant="body1">
                        <strong>Address:</strong> {
                        `
                          ${currentUser.address.street},
                          ${currentUser.address.unit ? ` ${currentUser.address.unit},` : ""}
                          ${currentUser.address.city}, ${currentUser.address.state} ${currentUser.address.postalCode}
                        `}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={11}>
                    <Typography variant="body1">
                      <strong>Phone Number:</strong> {currentUser.phone || "Not provided"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper>
                <Grid item xs={12} style={{ backgroundColor: "#F6F6F6", marginBottom: "1rem" }}>
                  <Grid container spacing={2} justify="center">
                    <Grid item xs={11}>
                      <Box display="flex">
                        <Typography style={{ flexGrow: 1 }} variant="h4">
                          Selected Membership
                        </Typography>
                        <Button variant="text" onClick={() => setActiveStep(2)}>
                          Edit
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container spacing={2} justify="center">
                  <Grid item xs={11}>
                    <Grid container spacing={2} justify="center">
                      <MembershipPreview readOnly={true} />
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper>
                <Grid item xs={12} style={{ backgroundColor: "#F6F6F6", marginBottom: "1rem" }}>
                  <Grid container spacing={2} justify="center">
                    <Grid item xs={11}>
                      <Box display="flex">
                        <Typography style={{ flexGrow: 1 }} variant="h4">
                          Payment Method
                        </Typography>
                        <Button variant="text" onClick={() => setActiveStep(3)}>
                          Edit
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid container spacing={2} justify="center">
                  <Grid item xs={11} style={{ marginBottom: "1rem" }}>
                    {isRequesting ?  <LoadingOverlay contained={true} /> :
                        error ? <ErrorMessage error={error} /> : paymentMethod ? (
                          <PaymentMethodComponent
                            {...paymentMethod}
                            id={`select-payment-method-${paymentMethodIdParam}`}
                          />
                        ) : "None selected"
                    }
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper>
                <Grid container spacing={2} justify="center">
                  <Grid item xs={11}>
                    <Typography variant="body1">
                      I, {currentUser.firstname} {currentUser.lastname}, authorize Manchester Makerspace to charge {total}{" "}
                      to the payment method I have selected every {selectedOpt?.quantity} month(s). I understand that this authorization
                      will remain in effect until I notify Manchester Makerspace of cancellation in writing or electronically
                      through <a target="_blank" href={`${buildProfileRouting(currentUser.id)}/settings`}>Subscription Settings</a>.
                    </Typography>
                    <CheckboxInput required={true} label={checkboxField.label} fieldName={checkboxField.name} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {children}
          </Grid>
        </Form>
      </Grid>
    </Grid>
  );
};
