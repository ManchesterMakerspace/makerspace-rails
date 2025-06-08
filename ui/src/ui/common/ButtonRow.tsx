import * as React from "react";
import Button, { ButtonProps } from "@material-ui/core/Button";
import kebabCase from "lodash-es/kebabCase";

export interface ActionButtonProps {
  color: ButtonProps["color"];
  variant: ButtonProps["variant"];
  disabled?: boolean;
  onClick: () => void;
  label: string;
  id?: string;
  style?: { [key: string]: string }
}


export const ActionButton: React.FC<ActionButtonProps> = (props) => (
  <Button
    id={props.id}
    style={{ marginRight: ".25em", ...props.style }}
    color={props.color}
    variant={props.variant}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.label}
  </Button>
)

const ButtonRow: React.SFC<{ actionButtons: ActionButtonProps[] }> = (props) => {
  return (
    <>
      {Array.isArray(props.actionButtons) && props.actionButtons.map((action, index) => (
        <ActionButton {...action} key={`${kebabCase(action.label)}-${index}`} />
      ))}
    </>
  )
}

export default ButtonRow;