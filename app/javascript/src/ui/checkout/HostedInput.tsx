import * as React from "react";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

interface Props {
  label: string;
  id: string;
}
const HostedInput: React.SFC<Props> = (props) => {
  return (
    <FormControl
      fullWidth
      required
      >
      <FormLabel>
        {props.label} 
      </FormLabel>
      <div 
        id={props.id}
        className="hosted-field"
      ></div>
    </FormControl>
  )
}

export default HostedInput;