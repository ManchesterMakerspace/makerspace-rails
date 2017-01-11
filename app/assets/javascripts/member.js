class Member {
  constructor(fullname, expirationTime){
    this.fullname = fullname;
    this.expirationTime = expirationTime;
  }

  formatExpTime(){
    var d = new Date(this.expirationTime).toDateString();
    return d;
  }
}
