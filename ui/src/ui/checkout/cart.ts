import * as React from "react";
import { AnyAction } from "redux";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Invoice, InvoiceOption } from "makerspace-ts-api-client";

export enum CartAction {
  AddToCart = "CART/ADD",
  RemoveFromCart = "CART/REMOVE",
  EmptyCart = "CART/EMPTY",
}

type InvoiceSelection = Invoice;
export type InvoiceOptionSelection = InvoiceOption & {
  discountId: string;
}
export type CartItem = InvoiceSelection | InvoiceOptionSelection;
export const isInvoiceSelection = (item: CartItem): item is InvoiceSelection => item.hasOwnProperty("dueDate");
export interface CartState {
  item: CartItem;
}

const defaultState: CartState = {
  item: undefined
};

const dispatchAction = <T>(dispatch: any) => (type: CartAction, data?: T ) => {
  dispatch({ type, data });
}
export const useEmptyCart = () => {
  const dispatch = useDispatch();
  return () => dispatchAction(dispatch)(CartAction.EmptyCart)
};
export const useAddToCart = () => {
  const dispatch = useDispatch();
  return (item: CartItem) => dispatchAction(dispatch)(CartAction.AddToCart, item)
};
export const useRemoveFromCart = () => {
  const dispatch = useDispatch();
  return (item: CartItem | string) => dispatchAction(dispatch)(CartAction.RemoveFromCart, item);
};
export const useCartState = (): CartState => {
  const getState = React.useCallback((state) => state.cart, []);
  return useSelector(getState, shallowEqual);
}

export const cartReducer = (state: CartState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case CartAction.AddToCart:
      return {
        item: action.data
      }
    case CartAction.RemoveFromCart:
      return {
        item: {}
      }
    // TODO: Handle multiple itmes
    // case CartAction.AddToCart:
    //   return {
    //     items: [...state.items, action.data]
    //   };
    // case CartAction.RemoveFromCart:
    //   const identifer = action.data;
    //   const newItems = state.items.filter(item => {
    //     if (typeof identifer === "string") {
    //       return item.id === identifer;
    //     } else {
    //       return item === identifer;
    //     }
    //   });
    //   return { items: newItems };
    case CartAction.EmptyCart:
      return { ...defaultState };
    default:
      return state;
  }
}