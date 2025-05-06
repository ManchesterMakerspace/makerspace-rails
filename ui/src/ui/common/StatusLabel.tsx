import * as React from "react";
import { Status } from "ui/constants";

interface StatusLabelProps {
  label: string;
  color: Status;
  id?: string;
}
const statusToStyleMap: Record<Status, { backgroundColor: string }> = {
  [Status.Danger]: {backgroundColor: "rgba(255, 0, 0, 1)"},
  [Status.Default]: { backgroundColor: "rgba(0, 0, 0, 0.12)"},
  [Status.Success]: { backgroundColor: "rgba(88, 227, 111, 1)" },
  [Status.Info]: { backgroundColor: "rgba(0, 0, 0, 0.12)"},
  [Status.Primary]: { backgroundColor: "rgba(33, 150, 243, 1)"},
  [Status.Warn]: {backgroundColor: "rgba(255, 152, 0, 1)"},
}

const circleStyle = {
  height: "1em",
  width: "1em",
  borderRadius: "50%",
  display: "inline-block",
  marginRight: "5px",
};

const StatusLabel: React.SFC<StatusLabelProps> = (props) => {
  return (
    <span style={{whiteSpace: "nowrap"}}>
      <span style={{...circleStyle, ...statusToStyleMap[props.color]}}>&nbsp;</span>
      <span id={props.id}>{props.label}</span>
    </span>
  );
}

export default StatusLabel;