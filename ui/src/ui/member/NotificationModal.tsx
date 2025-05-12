import * as React from "react";
import Typography from "@material-ui/core/Typography";

import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

export enum Notification {
  Welcome = "welcome",
  WelcomeNeedContract = "welcomeNeedContract",
  // WelcomeNeedPayment = "welcomeNeedPayment",
  // MembershipExpired = "membershipExpired",
  // PaymentRequired = "paymentRequired",
  SignRental = "SignRental",
  IdentifcationDetails = "IdentifcationDetails"
}

const Notifications = {
  [Notification.WelcomeNeedContract]: {
    title: "Welcome to Manchester Makerspace",
    submit: "Review Documents",
    body: `Thank you joining Manchester Makerspace.

    You will receieve an invitation to the Manchester Makerspace Slack workspace and Google Drive account shortly if you have not already. If you're unfamiliar with these tools, Slack is a messaging application where members collaborate on projects and coordinate use of the space.  Google Drive is where we store all sorts of member resources including equipment manuals.

    You can review your profile now. Please note, if you just signed up, your membership will not be active until we receive your payment and you receive your key.

    Before proceeding, please take a moment to review and sign the Manchester Makerspace Code of Conduct and Member Contract.`,
    required: true,
  },
  [Notification.Welcome]: {
    title: "Welcome to Manchester Makerspace",
    submit: "Close",
    body: `Thank you joining Manchester Makerspace.

    You will receieve an invitation to the Manchester Makerspace Slack workspace and Google Drive account shortly if you have not already. If you're unfamiliar with these tools, Slack is a messaging application where members collaborate on projects and coordinate use of the space.  Google Drive is where we store all sorts of member resources including equipment manuals.

    You can review your profile now. Please note, if you just signed up, your membership will not be active until we receive your payment and you receive your key.`,
    required: true,
  },
  [Notification.SignRental]: {
    title: "Please complete your Rental Agreement",
    submit: "Review Documents",
    body: `We are missing a signed rental agreement for one of your plot, shelf or locker rentals.  Please take a moment to review these documents before continuing`,
    required: true,
  },
  [Notification.IdentifcationDetails]: {
    title: "Please complete your profile",
    submit: "Review profile",
    body: "Your profile is missing some required information such as your address. Please take a moment to review and update your account.",
    required: true
  }
}

interface Props {
  notification: Notification;
  onSubmit: (form: Form) => void;
  onClose: () => void;
}

const NotificationModal: React.FC<Props> = ({ notification, onSubmit, onClose }) => {
  const displayedNotification = Notifications[notification];
  if (!displayedNotification) {
    return null;
  }

  const closeHandler = displayedNotification.required ? undefined : onClose;
  return (
    <FormModal
      id="notification-modal"
      isOpen={true}
      title={displayedNotification.title}
      onSubmit={onSubmit}
      submitText={displayedNotification.submit}
      closeHandler={closeHandler}
    >
      <Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
        {displayedNotification.body}
      </Typography>
    </FormModal>
  );
};


export default NotificationModal;
