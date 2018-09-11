import * as React from "react";
import { Typography } from "@material-ui/core";

interface ItemProps {
  label: string | JSX.Element;
  value: string | JSX.Element;
}

const KeyValueItem: React.SFC<ItemProps> = (props) => (
  <div style={{ paddingBottom: "1em" }}>
    <strong>{props.label}: </strong>{props.value}
  </div>
)

export default KeyValueItem;