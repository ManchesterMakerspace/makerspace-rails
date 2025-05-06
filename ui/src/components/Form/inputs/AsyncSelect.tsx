import * as React from "react";
import AsyncSelect, { Props as AsyncProps } from "react-select/lib/Async";
import Createable, { Props as CreateableProps } from "react-select/lib/Creatable";
import AsyncCreatable from "react-select/lib/AsyncCreatable";

import { formDialogClass } from "ui/common/FormModal";
import { FormField } from "../FormField";
import { InputProps } from "./types";

interface Props extends Omit<InputProps<any>, "label"> {
  createable?: boolean;
}

export type AsyncSelectProps<OptionType> = AsyncProps<OptionType> & Props;
export type CreateableSelectProps<OptionType> = CreateableProps<OptionType> & Props;
export type AsyncCreateableSelectProps<OptionType> = AsyncSelectProps<OptionType> & CreateableSelectProps<OptionType>;

function ModifiedSelect<
  OptionType,
  T extends Props & Pick<AsyncCreateableSelectProps<OptionType>, "onChange"> & { element: React.ComponentClass }
>(props: T) {
  const { fieldName, validate, defaultValue, required } = props;
  const formDialog = document.getElementsByClassName(formDialogClass)[0];
  const modifiedProps = {
    ...props,
    ...formDialog && {
      menuPortalTarget: formDialog as HTMLElement
    },
    name: fieldName,
    id: fieldName,
  }
  return (
    <FormField
      fieldName={fieldName}
      validate={validate}
      defaultValue={defaultValue || ""}
      required={!!required}
    >
      {(value, onChange, error) => (
        <props.element error={error} {...modifiedProps } onChange={onChange} value={value} />
      )}
    </FormField>
  );
}

export function AsyncCreatableSelect<OptionType>(props: AsyncCreateableSelectProps<OptionType>): React.ReactElement<AsyncCreateableSelectProps<OptionType>> {
  return <ModifiedSelect {...props} element={AsyncCreatable} />;
}

export function AsyncSelectFixed<OptionType>(props: AsyncSelectProps<OptionType>): React.ReactElement<AsyncSelectProps<OptionType>> {
  return <ModifiedSelect {...props} element={AsyncSelect} />;
}

export function CreateableSelect<OptionType>(props: CreateableSelectProps<OptionType>): React.ReactElement<CreateableSelectProps<OptionType>> {
  return <ModifiedSelect {...props} element={Createable} />;
}

export default AsyncSelectFixed;
