import * as React from "react";
import { connect } from "react-redux";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { AuthMember } from "ui/auth/interfaces";
import { timeToDate } from "ui/utils/timeToDate";
const codeOfConduct = require('code_of_conduct.html') as string;
const memberContract = require('member_contract.html') as string;
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { Button, Checkbox } from "@material-ui/core";
import Form from "ui/common/Form";
import ErrorMessage from "ui/common/ErrorMessage";

interface OwnProps {}
interface StateProps {
  currentUser: AuthMember;
}
interface Props extends OwnProps, StateProps {}

interface State {
  display: Documents;
  acceptCodeOfConduct: boolean;
  acceptMemberContract: boolean;
  documentError: string;
}

enum Documents {
  codeOfConduct = "code_of_conduct",
  memberContract = "member_contract",
}

type DocumentForm = {
  codeOfConduct?: boolean;
  memberContract?: boolean;
}

class SignDocuments extends React.Component<Props, State>{
  public constructor(props: Props) {
    super(props);
    this.state = {
      display: Documents.codeOfConduct,
      acceptCodeOfConduct: false,
      acceptMemberContract: false,
      documentError: ""
    }
  }

  private completeCodeOfConduct = async (form: Form) => {
    const documentField = this.documents()[Documents.codeOfConduct];

    await form.simpleValidate({ [Documents.codeOfConduct]: documentField });
    if (!form.isValid()) {
      this.setState({ documentError: documentField.error });
      return;
    }
    this.setState({ display: Documents.memberContract })
  }
  private getCodeOfConduct = () => {
    const document = this.documents()[Documents.codeOfConduct];
    return (
      <Form
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
                name={document.name}
                checked={document.value}
                onChange={this.acceptDocument(document.name)}
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
        id="member-contract-form"
        submitText="Proceed"
        onSubmit={this.completeDocuments}
        error={this.state.documentError}
      >
        {this.renderDocument(formattedMemberContract)}
        <div key={document.name}>
          <FormControlLabel
            control={
              <Checkbox
                name={document.name}
                checked={document.value}
                onChange={this.acceptDocument(document.name)}
                color="primary"
              />
            }
            label={document.label}
          />
        </div>
      </Form>
    );
  }

  private acceptDocument = (acceptedDoc: Documents) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (acceptedDoc === Documents.codeOfConduct) {
      this.setState({ acceptCodeOfConduct: checked });
    } else if (acceptedDoc === Documents.memberContract) {
      this.setState({ acceptMemberContract: checked });
    }
  }
  private completeDocuments = (form: Form) => {
    const values = form.getValues();
    console.log(values);
    const { acceptCodeOfConduct, acceptMemberContract } = this.state;
    if (acceptCodeOfConduct && acceptMemberContract) {
      // Success
    } else if (acceptCodeOfConduct) {

    }
  }

  private documents = () => ({
    [Documents.codeOfConduct]: {
      displayName: "Code of Conduct",
      name: Documents.codeOfConduct,
      render: this.getCodeOfConduct,
      value: this.state.acceptCodeOfConduct,
      validate: (val: boolean) => !!val,
      error: "You must accpet to continue",
      label: "I have read and agree to abide by the Manchester Makerspace Code of Conduct",
    },
    [Documents.memberContract]: {
      displayName: "Member Contract",
      name: Documents.memberContract,
      render: this.getMemberContract,
      value: this.state.acceptMemberContract,
      validate: (val: boolean) => !!val,
      error: "You must accpet to continue",
      label: "I have read and agree to the Manchester Makerspace Member Contract",
    }
  })
  private renderDocument = (documentString: string) => (
    <div dangerouslySetInnerHTML={{ __html: documentString }} />
  )
  public render() {
    const activeDisplay = this.documents()[this.state.display];
    return activeDisplay.render();
    // return (
    //   <>
    //     <Tabs
    //       value={activeDisplay.name}
    //       indicatorColor="primary"
    //       fullWidth={true}
    //       textColor="primary"
    //       style={{ marginBottom: "1em" }}
    //     >
    //       {Object.values(this.documents()).map(document => (
    //         <Tab
    //           label={document.displayName}
    //           value={document.name}
    //           key={document.name}
    //         />
    //       ))}
    //     </Tabs>
    //     { activeDisplay.render()}

    //   </>
    // );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { currentUser } = state.auth;

  return {
    currentUser,
  }
}

export default connect(mapStateToProps)(SignDocuments);