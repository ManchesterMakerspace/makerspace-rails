import * as React from "react";
import { MemberDetails, MemberStatus } from "app/entities/member";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";

export const memberStatusLabelMap = {
  [MemberStatus.Active]: "Active",
  [MemberStatus.Revoked]: "Revoked",
  [MemberStatus.NonMember]: "Non-Member",
  [MemberStatus.Inactive]: "Inactive"
};

const MemberStatusLabel: React.SFC<{ member: Partial<MemberDetails>, id?: string }> = (props) => {
  const { member } = props;
  const inActive = ![MemberStatus.Active, MemberStatus.NonMember].includes(member.status);
  const current = member.expirationTime > Date.now();

  let statusColor;
  if (!member.expirationTime) {
    statusColor = Status.Info;
  } else {
    statusColor = current && !inActive ? Status.Success : Status.Danger;
  }

  let label;
  if (inActive) {
    label = memberStatusLabelMap[member.status];
  } else {
    if (!member.expirationTime) {
      label = "N/A"
    } else {
      label = current ? "Active" : "Expired";
    }
  }

  return (
    <StatusLabel id={props.id} label={label} color={statusColor} />
  );
}

export default MemberStatusLabel;