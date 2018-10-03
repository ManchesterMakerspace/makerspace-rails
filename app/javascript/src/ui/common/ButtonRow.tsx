import * as React from "react";
import Button, { ButtonProps } from "@material-ui/core/Button";
import kebabCase from "lodash-es/kebabCase";

export interface ActionButton {
  color: ButtonProps["color"];
  variant: ButtonProps["variant"];
  disabled?: boolean;
  onClick: () => void;
  label: string;
  style?: { [key: string]: string }
}

const ButtonRow: React.SFC<{ actionButtons: ActionButton[] }> = (props) => {
  return (
    <>
      {Array.isArray(props.actionButtons) && props.actionButtons.map((action, index) => (
        <Button
          key={`${kebabCase(action.label)}-${index}`}
          style={{ marginRight: ".25em", ...action.style }}
          color={action.color}
          variant={action.variant}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </>
  )
}

export default ButtonRow;