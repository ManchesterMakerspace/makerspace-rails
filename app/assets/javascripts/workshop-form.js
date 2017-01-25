var workshopID;

$(document).ready(function() {
  workshopID = $('.workshopDiv').attr('id');
  attachListeners();
})

function attachListeners() {
  listSkills();
  showWorkshop();
}

function reattachListeners() {
  deleteSkill();
  editSkill();
  newSkill();
}

function listSkills() {
  $('#getSkillsButton').on("click", function(event) {
      $.ajax({
        url: '/workshops/' + workshopID + '/skills.json',
        success: function(data){
          $(".requiredSkills").show();
          var html;
          const dataLength = data.length;
          for (let i = 0; i < dataLength; i++){
            var skill = new Skill(data[i])
            html += skill.newTableRow();
          }
          $("#newSkill").attr('href', '/workshops/' + workshopID + '/skills')
          $(".currentSkills").html(html);
          $("#getSkillsButton").hide();
          reattachListeners();
        }
      });
      event.preventDefault();
  })
}

function deleteSkill() {
  $('.deleteSkill').on("click", function(event) {
    event.preventDefault();
    var url = $(this).attr('href');
    thisRow = $(this).closest('tr');
    $.ajax({
      url: url + '.json',
      type: 'DELETE',
      beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
      success: function(data){
        removeRow(thisRow);
      }
    });
  });
}

function removeRow(row) {
  row.remove();
}


function editSkill() {
  $('.editSkill').on("click", function(event) {
    event.preventDefault();
    var url = $(this).attr('href');
    var skillID = $(this).parent('td').siblings(".currentSkill").attr('id')
    var currentName = $('.currentSkill#' + skillID).html(); //saves current name before edit

    $('.currentSkill#' + skillID).html("<input type='text' name='skill[name]' value='" + currentName + "'> <button type='button' class='saveName'>Save</button> <button type='button' class='cancel'>Cancel</button>"); //change current name into input field

    $('.currentSkill#' + skillID + ' .saveName').on('click', function() { //submit ajax when save button is clicked.
      var newName = $('.currentSkill#' + skillID + ' input[name="skill[name]"]').val();
      $.ajax({
        url: url + '.json',
        type: 'PATCH',
        data: {skill: {name: newName}},
        beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
        success: function(data){
          $('.currentSkill#' + skillID).text(data.name);
        }
      });
    });

    $('.currentSkill#' + skillID + ' .cancel').on('click', function() { //revert to prior name if cancelled
      $('.currentSkill#' + skillID).html(currentName);
    });
  });
}

function newSkill() {
  $('#newSkill').on("click", function(event) {
    event.preventDefault();
    var url = $(this).attr('href');
    $('.newSkillName').html("<input type='text' name='skill[name]'><button type='button' class='createSkill'>Create</button>");
    $('.createSkill').on("click", function(){
      const newSkillName = $('.newSkillName input[name="skill[name]"]').val();
      if (newSkillName !== '') {
        $.ajax({
          url: url + '.json',
          type: 'POST',
          data: { skill: { name: newSkillName, workshop_id: workshopID } },
          beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
          success: function(data) {
            var skill = new Skill(data);
            $('.currentSkills').append(skill.newTableRow());
            $('.newSkillName input[name="skill[name]"]').val("");
            reattachListeners();
          }
        });
      }
      else {
        alert('Skill name cannot be blank.');
        reattachListeners();
      }
    });
  });
}

function showWorkshop() {
  $('.showWorkshop').on("click", function(event) {
    event.preventDefault();
    workshopID = $(this).attr('id');
    var url = $(this).attr('href');
    $.ajax({
      url: url + '.json', //it is cleaner to use an html request and just replace the html in the other pane.
      success: function(data){
        var shop = new Workshop(data._id.$oid, data.name, data.experts, data.officer.fullname);
        workshopID = shop.id
        $('.workshopDiv').attr('id', shop.id);
        $('#editWorkshopID').attr('href', '/admin/workshops/' + shop.id + '/edit');
        $('#workshop-name').text(shop.name);
        $('#workshop-experts').text('Experts: ' + shop.listExperts() );
        $('#workshop-officer').text('Officer: ' + shop.officer);
        $(".requiredSkills").hide();
        $('#getSkillsButton').text('Show Workshop Skills');
        $("#getSkillsButton").show();
      }
    });
  });
}
