import * as React from "react";
import { Status } from "ui/common/constants";
import { Chip } from "@material-ui/core";

interface StatusLabelProps {
  label: string;
  color: Status;
}
const statusToStyleMap = {
  [Status.Danger]: {backgroundColor: "rgba(255, 0, 0, 0.4)"},
  [Status.Success]: {backgroundColor: "rgba(88, 227, 111, 0.4)"},
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
    <>
      <span style={{...circleStyle, ...statusToStyleMap[props.color]}}>&nbsp;</span>
      <span>{props.label}</span>
    </>
  );
}

export default StatusLabel;