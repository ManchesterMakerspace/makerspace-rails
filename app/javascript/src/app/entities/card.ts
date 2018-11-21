  export interface AccessCard {
    id: string;
    uid: string;
    holder: string;
    expiry: number;
    validity: CardStatus | CardLocation;
    cardLocation: CardLocation
  }

  export enum Properties {
    Id = "id",
    Uid = "uid",
    Holder = "holder",
    Expiry = "expiry",
    Validity = "validity",
  }

  export enum CardLocation {
    Lost = "lost",
    Stolen = "stolen",
  }
  export enum CardStatus {
    Active = "activeMember",
    Revoked = "revoked",
    NonMember = "nonMember",
    Inactive = "inactive",
    Expired = "expired",
  }
