// deleteSkill
// editSkill
// addSkill
// newSkillName
var workshopID, newRow, newSkillName, skill, thisRow;

$(document).ready(function() {
  workshopID = $('.workshopDiv').attr('id');
  attachListeners();
})

function attachListeners() {
  listSkills();
  }

  function reattachListeners() {
    deleteSkill();
    editSkill();
    newSkill();
  }

function listSkills() {
  $('#getSkillsButton').on("click", function() {
    var currentButton = $('#getSkillsButton').text();
    if (currentButton === 'Show Workshop Skills'){
      $.ajax({
        url: '/workshops/' + workshopID + '/skills',
        cache: false,
        success: function(html){
          $('#getSkillsButton').text('Hide Workshop Skills');
          $("#getSkillsList").append(html);
          deleteSkill();
          editSkill();
          newSkill();
        }
      });
    }
    else if (currentButton === 'Hide Workshop Skills') {
      $(".requiredSkills").remove();
      $('#getSkillsButton').text('Show Workshop Skills');
    }
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
    var skillID = url.replace(/^(\/skills\/)/, "");
    var currentName = $('.currentSkill#' + skillID).html();
    $('.currentSkill#' + skillID).html("<input type='text' name='skill[name]' value='" + currentName + "'> <button type='button' class='saveName'>Save</button> <button type='button' class='cancel'>Cancel</button>");
    $('.currentSkill#' + skillID + ' .saveName').on('click', function() {
      var newName = $('.currentSkill#' + skillID + ' input[name="skill[name]"]').val();
      $.ajax({
        url: '/workshops/' + workshopID + '/' + url + '.json',
        type: 'PATCH',
        data: {skill: {name: newName}},
        beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
        success: function(data){
          $('.currentSkill#' + skillID).text(data.name);
        }
      });
    });
    $('.currentSkill#' + skillID + ' .cancel').on('click', function() {
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
      newSkillName = $('.newSkillName input[name="skill[name]"]').val();
      skill = new Skill('noID', newSkillName);
      if (skill.nameBlank() === false ){
        $.ajax({
          url: url + '.json',
          type: 'POST',
          data: {skill: {name: newSkillName, workshop_id: workshopID}},
          beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
          success: function(data) {
            var newSkill = new Skill(data._id.$oid, data.name);
            newRow = '<tr><td style="width: 100px"><a href="/skills/' + newSkill.id + '" class="deleteSkill"><strong>X</strong></a></td>';
            newRow += '<td style="width: 100px"><a href="/skills/' + newSkill.id + '" class="editSkill"><strong>Edit</strong></a></td>';
            newRow += '<td class="currentSkill" id="' + newSkill.id + '">' + newSkill.name + ' </td></tr>';
            $('.currentSkills').append(newRow);
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
