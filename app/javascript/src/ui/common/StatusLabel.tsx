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

const StatusLabel: React.SFC<StatusLabelProps> = (props) => {
  return (
    <Chip label={props.label} style={statusToStyleMap[props.color]} />
  )
}

export default StatusLabel;