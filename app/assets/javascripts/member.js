class Member {
  constructor(fullname, expirationTime, cardID, role){
    this.fullname = fullname;
    this.expirationTime = expirationTime;
    this.cardID = cardID;
    this.role = role;
  }

  formatExpTime(){
    var d = new Date(this.expirationTime).toDateString();
    return d;
  }
}
