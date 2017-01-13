class Skill {
  constructor(id, name){
    this.id = id;
    this.name = name;
  }

  nameBlank(){
    return (this.name === "");
  }
}
