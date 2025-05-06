import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { Member } from "makerspace-ts-api-client";
import KeyValueItem from "ui/common/KeyValueItem";
import { displayMemberExpiration } from "ui/member/utils";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import { getDetailsForMember } from "ui/member/constants";
import { useGoToSignUp } from "pages/registration/useGoToSignUp";

interface Props {
  member: Member;
}

/**
 * Component for when a member is viewing membership details but they don't have a subscription yet
 */
const NoSubscriptionDetails: React.FC<Props> = ({ member }) => {
  const goToSignUp = useGoToSignUp();

  const details = getDetailsForMember(member);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <KeyValueItem label="Membership Expiration">
            <span id="member-detail-expiration">{displayMemberExpiration(member)}</span>
          </KeyValueItem>
          <KeyValueItem label="Membership Status">
            <MemberStatusLabel id="member-detail-status" member={member} />
          </KeyValueItem>
          <KeyValueItem label="Membership Type">
            <span id="member-detail-type">{details.type}</span>
          </KeyValueItem>
        </Grid>
        <Grid item xs={12}>
          <Typography>{details.description}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            id="settings-create-membership-button"
            variant="contained"
            disabled={!details.allowMod}
            onClick={() => goToSignUp()}
          >
            {member.expirationTime ? "Update Membership" : "Create Membership"}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default NoSubscriptionDetails;