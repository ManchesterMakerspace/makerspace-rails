class Workshop {
  constructor(attributes){
    this.id = attributes._id.$oid;
    this.name = attributes.name;
    this.officer = attributes.officer.fullname;
    this.experts = attributes.experts;
    this.skills = attributes.skills;
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

  newSkillsTable(){
    var table =  []
    var l = this.skills.length
    for(let i = 0; i < i; i++){
      table.push(`<tr><td>${this.name}</td></tr>`)
    }
    return table.join("");
  }
}
