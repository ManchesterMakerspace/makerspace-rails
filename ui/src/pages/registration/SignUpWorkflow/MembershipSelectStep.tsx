import * as React from "react";
import useReactRouter from "use-react-router";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

import { InvoiceOption } from "makerspace-ts-api-client";
import { buildNewMemberProfileRoute } from "ui/member/utils";
import { useAuthState } from "ui/reducer/hooks";
import { ToastStatus, useToastContext } from "components/Toast/Toast";
import { Routing } from "app/constants";
import { MembershipSelectForm } from "../MembershipOptions/MembershipSelectForm";
import { noneInvoiceOption } from "../MembershipOptions";
import DuplicateMembershipModal from "ui/membership/DuplicateMembershipModal";

interface Props {}

export const MembershipSelectStep: React.FC<Props> = ({ children }) => {
  const { history } = useReactRouter();
  const { currentUser } = useAuthState();
  const { create } = useToastContext();

  const onSubmit = React.useCallback(async (invoiceOption: InvoiceOption) => {
    const isNoneOption = invoiceOption?.id === noneInvoiceOption.id;
    if (isNoneOption) {
      create({
        status: ToastStatus.Info,
        message: (
          <>
            <Typography component="span" variant="body1">Select a membership anytime in </Typography>
            <Link
              href={Routing.Settings.replace(Routing.PathPlaceholder.MemberId, currentUser.id)}
              target="_blank"
            >
              <Typography component="span" variant="body1">settings</Typography>
            </Link>
          </>
        )
      });

      history.push(buildNewMemberProfileRoute(currentUser.id));
      return;
    };
    return true;
  }, []);

  return (
    <>
      <MembershipSelectForm onSubmit={onSubmit}>
        {children}
      </MembershipSelectForm>
      <DuplicateMembershipModal />
    </>
  );
};
