import * as React from "react";

interface ItemProps {
  label: string | JSX.Element;
  [key: string]: string | object;
}

const KeyValueItem: React.SFC<ItemProps> = (props) => {
  const { label, children, ...rest } = props;
  const style = {
    paddingBottom: "1em",
    ...props.style as object,
  };
  return (
    <div {...rest} style={style}>
      <strong>{label}: </strong>{children}
    </div>
  )
};

export default KeyValueItem;