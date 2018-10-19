import * as React from "react";
import { MemberDetails, MemberStatus } from "app/entities/member";
import { Status } from "ui/common/constants";
import StatusLabel from "ui/common/StatusLabel";

export const memberStatusLabelMap = {
  [MemberStatus.Active]: "Active",
  [MemberStatus.Revoked]: "Revoked",
  [MemberStatus.NonMember]: "Non-Member",
};

const MemberStatusLabel: React.SFC<{ member: MemberDetails, id?: string }> = (props) => {
  const { member } = props;
  const inActive = member.status !== MemberStatus.Active;
  const current = member.expirationTime > Date.now();
  const statusColor = current && !inActive ? Status.Success : Status.Danger;

  let label;
  if (inActive) {
    label = memberStatusLabelMap[member.status];
  } else {
    label = current ? "Active" : "Expired";
  }

  return (
    <StatusLabel id={props.id} label={label} color={statusColor} />
  );
}

export default MemberStatusLabel;