class Workshop {
  constructor(id, name, experts, officer){
    this.id = id;
    this.name = name;
    this.officer = officer;
    this.experts = experts;
  }

  listExperts() {
    var count = 0;
    var e = [];
    while (typeof this.experts[count] != 'undefined'){
      e.push(this.experts[count].fullname);
      count ++;
    }
    return e.join(", ");
  }
}
