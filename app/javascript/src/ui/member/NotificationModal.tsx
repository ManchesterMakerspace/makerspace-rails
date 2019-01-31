import * as React from "react";
import Typography from "@material-ui/core/Typography";

import FormModal from "ui/common/FormModal";
import Form from "ui/common/Form";

export enum Notification {
  Welcome = "welcome",
  WelcomeNeedPayment = "welcomeNeedPayment",
  MembershipExpired = "membershipExpired",
  PaymentRequired = "paymentRequired",
}

const Notifications = {
  [Notification.Welcome]: {
    title: "Welcome to Manchester Makerspace",
    submit: "Review Documents",
    body: `Thank you joining Manchester Makerspace.

    You will receieve an invitation to the Manchester Makerspace Slack workspace and Google Drive account shortly if you have not already. If you're unfamiliar with these tools, Slack is a messaging application where members collaborate on projects and coordinate use of the space.  Google Drive is where we store all sorts of member resources including equipment manuals.

    Before proceeding, please take a moment to review and sign the Manchester Makerspace Code of Conduct and Member Contract.`,
    required: true,
  }
}

interface Props {
  notification: Notification;
  onSubmit: (form: Form) => void;
  onClose: () => void;
}

class NotificationModal extends React.Component<Props> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { notification, onSubmit, onClose } = this.props;

    const displayedNotification = Notifications[notification];
    if (!displayedNotification) {
      return null;
    }

    const closeHandler = displayedNotification.required ? undefined : onClose

    return (
      <FormModal
        formRef={this.setFormRef}
        id="notificsation-modal"
        isOpen={!!notification}
        title={displayedNotification.title}
        onSubmit={onSubmit}
        submitText={displayedNotification.submit}
        closeHandler={closeHandler}
      >
        <Typography variant="body1" style={{whiteSpace: "pre-line"}}>
          {displayedNotification.body}
        </Typography>
      </FormModal>
    )
  }
}

export default NotificationModal;
