import { MemberDetails } from "app/entities/member";

const membershipDetails = {
  none: {
    description: "No membership on file. Create a membership to add one.",
    type: "No membership found",
    allowMod: true,
  },
  paypal: {
    description: "Membership handled by PayPal. Contact an administrator for details.",
    type: "Managed by PayPal",
    allowMod: false,
  },
  notFound: {
    description: "Membership subscription cannot be found. Contact an administrator for assistance.",
    type: "Unknown",
    allowMod: false,
  },
  noSubscription: {
    description: "No subscription found. Update membership to enable automatic renewals.",
    type: "Month-to-month",
    allowMod: true,
  },
  earnedMembership: {
    description: "Membership sponsored by earned membership program.",
    type: "Earned Membership",
    allowMod: false,
  },
}

export const getDetailsForMember = (member: Partial<MemberDetails>) => {
  let details = membershipDetails.noSubscription;
  if (member.subscription && !member.subscriptionId) {
    details = membershipDetails.paypal;
  } else if (!member.expirationTime) {
    details = membershipDetails.none;
  } else if (member.earnedMembershipId) {
    details = membershipDetails.earnedMembership;
  }
  return details;
}