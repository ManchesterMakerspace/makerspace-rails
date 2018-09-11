import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";

interface StateProps {
  memberId: string;
}
interface OwnProps extends RouteComponentProps<any> {}
interface Props extends OwnProps {

}

interface State {

}

class MemberDetail extends React.Component<Props, State> {
  public render(): JSX.Element {
    return (
      <div>Foo</div>
    )
  }
}

export default withRouter(MemberDetail);