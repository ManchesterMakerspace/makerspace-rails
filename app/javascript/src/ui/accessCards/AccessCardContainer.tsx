import * as React from "react";
import { connect } from "react-redux";

import { MemberDetails } from "app/entities/member";
import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { createCardAction } from "ui/accessCards/actions";
import { readMemberAction } from "ui/member/actions";

export interface CreateAccessCardProps {
  isOpen: boolean;
  onClose: () => void;
  isRequesting: boolean;
  error: string;
  createAccessCard: (uid: string) => void;
  member: Partial<MemberDetails>;
}

interface OwnProps {
  member: Partial<MemberDetails>;
  isOpen: boolean;
  closeHandler: () => void;
  render: (renderPayload: CreateAccessCardProps) => JSX.Element;
}
interface DispatchProps {
  createAccessCard: (uid: string) => void;
  getMember: () => void;
}
interface StateProps {
  isRequesting: boolean;
  error: string;
}
interface Props extends OwnProps, DispatchProps, StateProps {}

class AccessCardContainer extends React.Component<Props> {

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting, error, closeHandler, getMember } = this.props;
    if (!isRequesting && prevProps.isRequesting && !error) {
      getMember();
      closeHandler();
    }
  }

  public render() {
    const { isRequesting, error, isOpen, closeHandler, createAccessCard, member } = this.props;
    return this.props.render({
      isRequesting,
      error,
      isOpen,
      member,
      createAccessCard,
      onClose: closeHandler,
    });
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const { isRequesting, error } = state.card.create;

  return {
    isRequesting,
    error,
  }
};
const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const memberId = ownProps.member && ownProps.member.id;
  return {
    createAccessCard: (uid) => dispatch(createCardAction(memberId, uid)),
    getMember: () => dispatch(readMemberAction(memberId)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AccessCardContainer);