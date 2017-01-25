class Skill {
  constructor(attributes){
    this.id = attributes._id.$oid;
    this.name = attributes.name;
    this.workshop_id = attributes.workshop._id.$oid;
  }

  newTableRow(){
    return `
      <tr>
        <td style='width: 100px'>
          <a href='/workshops/${this.workshop_id}/skills/${this.id}' class='deleteSkill'>
            <strong>X</strong>
          </a>
        </td>
        <td style='width: 100px'>
          <a href='/workshops/${this.workshop_id}/skills/${this.id}' class='editSkill'>
            <strong>Edit</strong>
          </a>
        </td>
        <td class='currentSkill' id='${this.id}'>${this.name}</td>
      </tr>
    `;
  }
}
