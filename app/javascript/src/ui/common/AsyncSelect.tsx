import * as React from "react";
import AsyncSelect, { Props } from 'react-select/lib/Async';
import { formDialogClass } from "ui/common/FormModal";


const AsyncSelectFixed: React.SFC<Props<any>> = (props) => {
  const formDialog = document.getElementsByClassName(formDialogClass)[0];
  const modifiedProps = {
    ...props,
    ...formDialog && {
      menuPortalTarget: formDialog as HTMLElement
    }
  }
  return <AsyncSelect {...modifiedProps } />
}


export default AsyncSelectFixed;
