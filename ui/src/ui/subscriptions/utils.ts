import { Subscription } from "makerspace-ts-api-client";

export const renderPlanType = (id: string) => {
  const planId = id || "";
  const membership = planId.match(/membership/);
  if (membership) {
    return "Membership";
  }
  const rental = planId.match(/rental/);
  if (rental) {
    const locker = planId.match(/locker/);
    if (locker) {
      return "Locker Rental";
    }
    const plot = planId.match(/plot/);
    if (plot) {
      return "Plot Rental";
    }
    const shelf = planId.match(/shelf/);
    if (shelf) {
      return "Shelf Rental";
    }
  }
}

export const isCanceled = (subscription: Subscription) => 
  subscription && subscription.status && subscription.status.toLowerCase() === "canceled";