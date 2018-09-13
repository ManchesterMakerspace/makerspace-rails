  export interface AccessCard {
    id: string;
    uid: string;
    holder: string;
    expiry: number;
    validity: CardStatus;
  }
  
  export enum Properties {
    Id = "id",
    Uid = "uid",
    Holder = "holder",
    Expiry = "expiry",
    Validity = "validity",
  }

  export enum CardStatus {
    Active = "activeMember",
    Revoked = "revoked",
    NonMember = "nonMember",
    Lost = "lost",
    Stolen = "stolen",
    Expired = "expired",
  }
