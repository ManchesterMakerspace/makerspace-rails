import * as React from "react";
import CheckoutForm from "ui/checkout/CheckoutForm";


class CheckoutContainer extends React.Component<{},{}>{
  public render(): JSX.Element {
    return (
      <CheckoutForm/>
    )
  }
}

export default CheckoutContainer;