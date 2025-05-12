import * as React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import HelpOutlineOutlined from "@material-ui/icons/HelpOutlineOutlined";
import useModal from "ui/hooks/useModal";
import { useAuthState } from "ui/reducer/hooks";
import FormModal from "ui/common/FormModal";

const Help: React.FC = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const { currentUser } = useAuthState();
  let subject = "Digital makerspace help requested";
  if (currentUser && currentUser.id) {
    subject += ` from ${currentUser.firstname} ${currentUser.lastname} (#${currentUser.id})`;
  }
  const mailLink = `mailto:contact@manchestermakerspace.org?subject="${subject}"`;

  return (
    <>
    <Tooltip title="Help">
      <IconButton aria-label="Help" onClick={openModal}>
        <HelpOutlineOutlined fontSize="large" color="primary"/>
      </IconButton>
    </Tooltip>
    {isOpen && (
      <FormModal
        isOpen={true}
        id="help-modal"
        title="Contact Us"
        closeHandler={closeModal}
        cancelText="Close"
      >
        <Typography variant="body1">
          Having trouble using our software? Please don't hesitate to
          {" "}
          <a href={mailLink} >contact us.</a>
        </Typography>
      </FormModal>
    )}
    </>
  )
}

export default Help;
