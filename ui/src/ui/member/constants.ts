import { emailValid } from "app/utils";
import { FormFields } from "ui/common/Form";
import { dateToTime } from "ui/utils/timeToDate";
import { Member, MemberRole } from "makerspace-ts-api-client";

const formPrefix = "member-form";
export const fields = (admin: boolean, member?: Partial<Member>): FormFields => ({
  firstname: {
    label: "First Name",
    name: `${formPrefix}-firstname`,
    placeholder: "Enter first name",
    validate: (val) => !!val,
    error: "Required"
  },
  lastname: {
    label: "Last Name",
    name: `${formPrefix}-lastname`,
    placeholder: "Enter last name",
    validate: (val) => !!val,
    error: "Required"
  },
  email: {
    label: "Email / Username",
    name: `${formPrefix}-email`,
    placeholder: "Enter email",
    validate: (val: string) => !!val && !!emailValid(val),
    error: "Required"
  },
  phone: {
    label: "Phone Number",
    name: `${formPrefix}-phone`,
  },
  street: {
    label: "Street Address",
    name: `${formPrefix}-street`,
    placeholder: "Enter street address",
    validate: (val: string) => admin || !!val,
    error: "Required"
  },
  unit: {
    label: "Unit or Apt #",
    name: `${formPrefix}-unit`,
  },
  city: {
    label: "City",
    name: `${formPrefix}-city`,
    placeholder: "Enter city",
    validate: (val: string) => admin || !!val,
    error: "Required"
  },
  state: {
    label: "State",
    name: `${formPrefix}-state`,
    placeholder: "Select a state",
    validate: (val: string) => admin || !!val,
    error: "Required"
  },
  postalCode: {
    label: "Postal Code",
    name: `${formPrefix}-postalCode`,
    placeholder: "Postal Code",
    validate: (val: string) => admin || !!val,
    error: "Required"
  },
  ...admin && {
    status: {
      label: "Status",
      name: `${formPrefix}-status`,
      placeholder: "Select one",
      validate: (val) => !!val,
      error: "Invalid status"
    },
    groupName: {
      label: "Group Name (optional)",
      name: `${formPrefix}-groupName`,
      placeholder: "Select one",
    },
    ...member && member.id && {
      expirationTime: {
        label: "Expiration Date",
        name: `${formPrefix}-expirationTime`,
        placeholder: "Membership Expiration",
        transform: (val) => dateToTime(val),
        error: "Invalid expiration"
      },
    },
    role: {
      label: "Role",
      name: `${formPrefix}-role`,
      placeholder: "Select one",
      validate: (val) => !!val,
      error: "Invalid role"
    },
    memberContractOnFile: {
      label: "Member Contract Signed?",
      name: `${formPrefix}-contract`,
      validate: (val) => member && member.id ? true : val, // Validate contract only on create.
      transform: (val) => !!val,
      error: "Member must sign contract"
    },
    subscription: {
      label: "On PayPal Subscription (Warning: Don't touch this)",
      name: `${formPrefix}-subscription`,
      transform: (val) => !!val,
    },
    notes: {
      label: "Notes",
      name: `${formPrefix}-notes`,
    },
  },
  silenceEmails: {
    label: "Receive emails? (Excludes membership notifications)",
    name: `${formPrefix}-silenceEmails`,
    transform: val => !val
  }
})

export const MemberRoleOptions = {
  [MemberRole.Member]: "Member",
  [MemberRole.Admin]: "Admin"
}

export const membershipDetails = {
  none: {
    description: "No membership on file. Create a membership to add one.",
    type: "No membership found",
    allowMod: true,
  },
  paypal: {
    description: "Membership handled by PayPal. If you wish to change your membership, you must first cancel your PayPal subscription.",
    type: "Managed by PayPal",
    allowMod: false,
  },
  notFound: {
    description: "Membership subscription exists but cannot be found. Contact an administrator for assistance.",
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
  subscription: {
    description: "Recurring membership subscription by Braintree",
    type: "Subscription",
    allowMod: true,
  }
}

export const getDetailsForMember = (member: Partial<Member>) => {
  let details = membershipDetails.noSubscription;
  if (member.subscription && !member.subscriptionId) {
    details = membershipDetails.paypal;
  } else if (member.subscriptionId) {
    details = membershipDetails.subscription;
  } else if (!member.expirationTime) {
    details = membershipDetails.none;
  } else if (member.earnedMembershipId) {
    details = membershipDetails.earnedMembership;
  }
  return details;
}