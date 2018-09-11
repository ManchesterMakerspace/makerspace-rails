import * as React from "react";

interface ItemProps {
  label: string | JSX.Element;
}

const KeyValueItem: React.SFC<ItemProps> = (props) => (
  <div style={{ paddingBottom: "1em" }}>
    <strong>{props.label}: </strong>{props.children}
  </div>
)

export default KeyValueItem;