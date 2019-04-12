import * as React from "react";
import debounce from "lodash-es/debounce";
import AsyncSelect, { Props as AsyncProps } from 'react-select/lib/Async';
import Createable from "react-select/lib/Creatable";
import { formDialogClass } from "ui/common/FormModal";
import { SelectOption } from "ui/common/RenewalForm";
import Form from "ui/common/Form";
import { ActionMeta } from "react-select/lib/types";

interface Props extends AsyncProps<any> {
  name: string;
  createable?: boolean;
  getFormRef?: () => Form;
}

const AsyncSelectFixed: React.SFC<Props> = (props) => {
  // Capture onChange to update Form if defined
  const onChange = (option: SelectOption, action: ActionMeta) => {
    const form = props.getFormRef && props.getFormRef();
    if (form) {
      form.setValue(props.name, option);
      form.setError(props.name, undefined);
    }
    props.onChange(option, action);
  }

  const formDialog = document.getElementsByClassName(formDialogClass)[0];
  const modifiedProps = {
    ...props,
    ...formDialog && {
      menuPortalTarget: formDialog as HTMLElement
    },
    onChange: debounce(onChange, 250)
  }
  return props.createable ? <Createable {...modifiedProps} /> : <AsyncSelect {...modifiedProps } />
}


export default AsyncSelectFixed;
