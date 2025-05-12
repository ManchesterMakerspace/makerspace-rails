import * as React from "react";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Hidden from "@material-ui/core/Hidden";
import { InvoiceOption } from "makerspace-ts-api-client";
import { PromotionCards } from './PromotionCards';
import { MembershipOptionCards, NoneOption } from './MembershipOptionCards';
import { PromotionsTable } from './PromotionsTable';
import { MembershipOptionsTable } from './MembershipOptionsTable';
import { useMembershipOptions } from 'hooks/useMembershipOptions';
import { actionLabel } from "./constants";
import { MembershipOptionCard } from "./MembershipOptionCard";
 
interface Props {
  onSelect(option: InvoiceOption): void;
  shortForm?: boolean;
  showNoneOption?: boolean
}
export const MembershipOptions: React.FC<Props> = ({ onSelect, shortForm, showNoneOption = true }) => {
  const { defaultOption } = useMembershipOptions();

  return (
    <Grid container spacing={3} justify="center">
      {shortForm ? (
        <Grid item xs={12}>
          {defaultOption && (
            <MembershipOptionCard 
              key={defaultOption.id}
              option={defaultOption} 
              signUpButton={{ 
                onClick: onSelect,
                label: actionLabel, 
                color: "primary", 
                variant: "outlined"
              }}
            />
          )}
          <NoneOption onSelect={onSelect} />
        </Grid>
      ) : (
        <>
          <Hidden mdUp>
            <Grid item xs={12}>
              <PromotionCards onSelect={onSelect} />
            </Grid>
            <Grid item xs={12}>
              <MembershipOptionCards showNoneOption={showNoneOption} onSelect={onSelect} />
            </Grid>
          </Hidden>

          <Hidden smDown>
            <Grid item xs={12}>
              <PromotionsTable onSelect={onSelect} />
            </Grid>
            <Grid item xs={12}>
              <MembershipOptionsTable showNoneOption={showNoneOption} onSelect={onSelect} />
            </Grid>
          </Hidden>
        </>
      )}
    </Grid>
  )
}