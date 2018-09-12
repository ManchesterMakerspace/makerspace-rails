import * as React from "react";
import { Grid, Typography, Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import { kebabCase } from "lodash-es";

export interface ActionButton {
  color: ButtonProps["color"];
  variant: ButtonProps["variant"];
  disabled?: boolean;
  onClick: () => void;
  label: string;
}

const ButtonRow: React.SFC<{ actionButtons: ActionButton[] }> = (props) => {
  return (
    <>
      {props.actionButtons.map((action, index) => (
        <Button
          key={`${kebabCase(action.label)}-${index}`}
          style={{ marginRight: ".25em" }}
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