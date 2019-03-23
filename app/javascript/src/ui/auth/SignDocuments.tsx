import * as React from "react";
import { connect } from "react-redux";

import SignatureCanvas from "react-signature-canvas";

import Grid from "@material-ui/core/Grid";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { uploadMemberSignature } from "api/members/transactions";
import { AuthMember } from "ui/auth/interfaces";
import { timeToDate } from "ui/utils/timeToDate";
import Form from "ui/common/Form";
import { State as ReduxState } from "ui/reducer";

const codeOfConduct = require('code_of_conduct.html') as string;
const memberContract = require('member_contract.html') as string;

interface OwnProps {
  onSubmit: () => void;
}

interface StateProps {
  currentUser: AuthMember;
}
interface Props extends OwnProps, StateProps {}

interface State {
  display: Documents;
  acceptCodeOfConduct: boolean;
  acceptMemberContract: boolean;
  documentError: string;
  signatureUploadError: string;
  signatureUploading: boolean;
}

enum Documents {
  codeOfConduct = "code-of-conduct",
  memberContract = "member-contract",
}

class SignDocuments extends React.Component<Props, State>{
  private signatureRef: any;
  private setSignatureRef = (ref: any) => this.signatureRef = ref;

  public constructor(props: Props) {
    super(props);
    this.state = {
      display: Documents.codeOfConduct,
      acceptCodeOfConduct: false,
      acceptMemberContract: false,
      documentError: "",
      signatureUploadError: "",
      signatureUploading: false,
    }
  }

  // Make sure checkbox is checked, then switch to member contract
  private completeCodeOfConduct = async (form: Form) => {
    const documentField = this.documents()[Documents.codeOfConduct];

    await form.simpleValidate({ [Documents.codeOfConduct]: documentField });
    if (!form.isValid()) {
      return;
    }
    this.setState({ display: Documents.memberContract })
  }

  private getCodeOfConduct = () => {
    const document = this.documents()[Documents.codeOfConduct];
    return (
      <Form
        key={Documents.codeOfConduct}
        id="code-of-conduct-form"
        submitText="Proceed"
        onSubmit={this.completeCodeOfConduct}
        error={this.state.documentError}
      >
        {this.renderDocument(codeOfConduct)}
        <div key={document.name}>
          <FormControlLabel
            control={
              <Checkbox
                id={document.name}
                name={document.name}
                color="primary"
              />
            }
            label={document.label}
          />
        </div>
      </Form>
    );
  }
  private getMemberContract = () => {
    const formattedMemberContract = memberContract.replace('[name]', `<b>${this.props.currentUser.firstname} ${this.props.currentUser.lastname}</b>`)
                                                  .replace('[today]', `<b>${timeToDate(new Date())}</b>`);
    const document = this.documents()[Documents.memberContract];
    return (
      <Form
        key={Documents.memberContract}
        id="member-contract-form"
        submitText="Proceed"
        loading={this.state.signatureUploading}
        onSubmit={this.completeDocuments}
        error={this.state.documentError}
      >
        {this.renderDocument(formattedMemberContract)}
        <div key={document.name}>
          <FormControlLabel
            control={
              <Checkbox
                id={document.name}
                name={document.name}
                color="primary"
              />
            }
            label={document.label}
          />
        </div>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="subtitle1" align="left">Please sign below</Typography>
          </Grid>
          <Grid item xs={12} style={{ border: "1px solid black", borderRadius: "4px" }}>
            <SignatureCanvas ref={this.setSignatureRef} canvasProps={{ height: "250", width: "1000" }} />
            <Grid container justify="flex-end">
              <Grid item xs={12}>
                <Button variant="contained" color="secondary" onClick={this.clearSignature}>Reset Signature</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Form>
    );
  }

  private clearSignature = () => {
    this.signatureRef && this.signatureRef.clear();
  }

  // Verify signature and call submit callback
  private completeDocuments = async (form: Form) => {
    const documentField = this.documents()[Documents.memberContract];

    await form.simpleValidate({ [Documents.memberContract]: documentField });
    if (!form.isValid()) {
      return;
    }
    if (!this.signatureRef || this.signatureRef.isEmpty()) {
      this.setState({ documentError: "Signature required to proceed" });
      return;
    }
    const signature = this.signatureRef.toDataURL();
    try {
      this.setState({ signatureUploading: true });
      await uploadMemberSignature(this.props.currentUser && this.props.currentUser.id, signature);
      this.setState({ signatureUploading: false, signatureUploadError: "" });
    } catch (e) {
      this.setState({ signatureUploading: false, signatureUploadError: e });
    }
    this.props.onSubmit();
  }

  private documents = () => ({
    [Documents.codeOfConduct]: {
      displayName: "Code of Conduct",
      name: `${Documents.codeOfConduct}-checkbox`,
      render: this.getCodeOfConduct,
      value: this.state.acceptCodeOfConduct,
      transform: (val: string) => !!val,
      validate: (val: boolean) => val,
      error: "You must accept to continue",
      label: "I have read and agree to abide by the Manchester Makerspace Code of Conduct",
    },
    [Documents.memberContract]: {
      displayName: "Member Contract",
      name: `${Documents.memberContract}-checkbox`,
      render: this.getMemberContract,
      value: this.state.acceptMemberContract,
      transform: (val: string) => !!val,
      validate: (val: boolean) => val,
      error: "You must accept to continue",
      label: "I have read and agree to the Manchester Makerspace Member Contract",
    }
  })

  private renderDocument = (documentString: string) => (
    <div dangerouslySetInnerHTML={{ __html: documentString }} />
  )
  public render() {
    const activeDisplay = this.documents()[this.state.display];
    return (
      <Grid container spacing={16} justify="center">
        <Grid item md={10} sm={12}>
          {activeDisplay.render()}
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
): StateProps => {
  const { currentUser } = state.auth;

  return {
    currentUser
  }
}

export default connect(mapStateToProps)(SignDocuments);