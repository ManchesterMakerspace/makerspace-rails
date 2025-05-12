import * as React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Hidden from "@material-ui/core/Hidden";
import useTheme from "@material-ui/core/styles/useTheme";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import { InvoiceOption } from "makerspace-ts-api-client";
import { discountParam, invoiceOptionParam, MembershipOptions } from '../MembershipOptions';
import { useSearchQuery, useSetSearchQuery } from "hooks/useSearchQuery";
import { useMembershipOptions } from "hooks/useMembershipOptions";
import { Form } from "components/Form/Form";
import { CartPreview } from "../SignUpWorkflow/CartPreview";

interface Props {
  onSubmit(invoiceOption: InvoiceOption, discountId?: string): void;
  showNoneOption?: boolean
}

export const MembershipSelectForm: React.FC<Props> = ({ onSubmit, showNoneOption, children }) => {
  const {
    invoiceOptionId: invoiceOptionIdParam,
    discountId: discountIdParam,
  } = useSearchQuery({
    invoiceOptionId: invoiceOptionParam,
    discountId: discountParam
  });

  const { allOptions, promotionOptions, defaultOption } = useMembershipOptions(true);

  React.useEffect(() => {
    setInvoiceOption(allOptions.find(({ id }) => id === invoiceOptionIdParam));
  }, [invoiceOptionIdParam, allOptions]);

  const [invoiceOption, setInvoiceOption] = React.useState(allOptions.find(({ id }) => id === invoiceOptionIdParam));
  const setSearchQuery = useSetSearchQuery();
  const updateInvoiceOption = React.useCallback((newOpt: InvoiceOption) => {
    setSearchQuery({ [invoiceOptionParam]: newOpt.id });
    setInvoiceOption(newOpt);
  }, [setSearchQuery, setInvoiceOption]);

  React.useEffect(() => {
    const firstSelection = promotionOptions[0] || defaultOption;
    !invoiceOptionIdParam && firstSelection && updateInvoiceOption(firstSelection);
  }, [defaultOption]);

  const theme = useTheme();
  const isXsmMedia = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Form
      id="membership-select-form"
      onSubmit={() => onSubmit(invoiceOption, discountIdParam)}
      hideFooter={true}
    >
      <Grid container spacing={2} direction={isXsmMedia ? "row-reverse" : "row"}>
        <Grid item xs={12} md={8}>
          <Box>
            <Typography variant="body1">
              {invoiceOption ? "Confirm" : "Select"} your membership selection. If you have a discount code, please enter it now.
            </Typography>
          </Box>
          <MembershipOptions onSelect={updateInvoiceOption} showNoneOption={showNoneOption} />
        </Grid>
          <Hidden smDown><Divider orientation="vertical" flexItem /></Hidden>
          <Grid item xs={12} md={3}>
            <CartPreview />
          </Grid>
      </Grid>
      <>{children}</>
    </Form>
  );
};
