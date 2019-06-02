import * as React from "react";
import debounce from "lodash-es/debounce";
import { ActionMeta, ValueType } from "react-select/lib/types";
import AsyncSelect, { Props as AsyncProps } from "react-select/lib/Async";
import Createable, { Props as CreateableProps } from "react-select/lib/Creatable";
import AsyncCreatable from "react-select/lib/AsyncCreatable";

import { formDialogClass } from "ui/common/FormModal";
import { SelectOption } from "ui/common/RenewalForm";
import Form from "ui/common/Form";

interface Props {
  name?: string;
  getFormRef?: () => Form;
}

type AsyncSelectProps<OptionType> = AsyncProps<OptionType> & Props;
type CreateableSelectProps<OptionType> = CreateableProps<OptionType> & Props;
type AsyncCreateableSelectProps<OptionType> = AsyncSelectProps<OptionType> & CreateableSelectProps<OptionType>;

function ModifiedSelect<
  OptionType,
  T extends Props & Pick<AsyncCreateableSelectProps<OptionType>, "onChange"> & { element: React.ComponentClass }
>(props: T) {
  // Capture onChange to update Form if defined
  const onChange = (option: ValueType<OptionType>, action: ActionMeta) => {
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
  return <props.element {...modifiedProps } />;
}

export function AsyncCreatableSelect<OptionType>(props: AsyncCreateableSelectProps<OptionType>) {
  return <ModifiedSelect {...props} element={AsyncCreatable} />;
}

export function AsyncSelectFixed<OptionType>(props: AsyncSelectProps<OptionType>) {
  return <ModifiedSelect {...props} element={AsyncSelect} />;
}

export function CreateableSelect<OptionType>(props: CreateableSelectProps<OptionType>) {
  return <ModifiedSelect {...props} element={Createable} />;
}

export default AsyncSelectFixed;
