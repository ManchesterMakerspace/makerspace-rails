import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { InvoiceOption } from 'makerspace-ts-api-client';

import { useGoToSignUp } from '../useGoToSignUp';
import Card from 'components/Card/Card';
import { numberAsCurrency } from 'ui/utils/numberAsCurrency';

interface Props {
  option: InvoiceOption;
  signUpButton: {
    label: string;
    onClick(option: InvoiceOption): void;
    color?: React.ComponentProps<typeof Button>["color"],
    variant?: React.ComponentProps<typeof Button>["variant"]
  }
}

export const MembershipOptionCard: React.FC<Props> = ({ option, signUpButton, children }) => {
  const goToSignUp = useGoToSignUp();

  return (
    <Card>
      <Grid container spacing={3} justify="center">
        <Grid item xs={12}>
          <Typography variant="h5">
            {option.name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">
            {option.description}
          </Typography>
        </Grid>

        {children}

        <Grid item xs={6}>
          <Box textAlign="left">
            {option.amount && <Typography variant="body1">
              {numberAsCurrency(option.amount)} {!!option.quantity && <>/ {option.quantity === 1 ? "month" : `${option.quantity} months`}</>}
            </Typography>}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box textAlign="right">
            <Button 
              variant={signUpButton.variant} 
              color={signUpButton.color} 
              onClick={() => goToSignUp(option)}
              id={`membership-select-table-${option.id}-select-button`}
            >
              {signUpButton.label}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Card>
  )
}