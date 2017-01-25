class Member {
  constructor(attributes){
    this.id = attributes._id.$oid;
    this.fullname = attributes.fullname;
    this.expirationTime = attributes.expirationTime;
    this.cardID = attributes.cardID;
    this.role = attributes.role;
  }

  formatExpTime(){
    var d = new Date(this.expirationTime).toDateString();
    return d;
  }

  newTableRow(months){
    if (months === '1'){
      return `
        <li>  Name: <strong>${this.fullname}</strong>
          <ul>Renewed for: <strong> ${months} month </strong></ul>
          <ul> New Expiration Date: <strong>${this.formatExpTime()}</strong> </ul>
        </li>
      `
    }
    else{
      return `
        <li>  Name: <strong>${this.fullname}</strong>
          <ul>Renewed for: <strong> ${months} months </strong></ul>
          <ul> New Expiration Date: <strong>${this.formatExpTime()}</strong> </ul>
        </li>
      `
    }
  }


}
