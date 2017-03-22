var workshopID, userRole;

$(document).ready(function() {
  if (window.location.pathname === '/workshops'){
    workshopID = $('.workshopDiv').attr('id');
    attachListeners();
  }
})

function attachListeners() {
  checkUserRole();
  retrainAll();
  listSkills();
  listExperts();
  showWorkshop();
}

function reattachListeners() {
  deleteSkill();
  editSkill();
  newSkill();
}

function checkUserRole(){
  $.ajax({
    url: '/workshops/' + workshopID + '/check_role.json',
    success: function(data){
      configureButtons(data.role);
      userRole = data.role;
    }
  });
}

function configureButtons(role){
  if (role === 'officer'){
    $('#getSkillsButton').show();
    $('.newSkillName').show();
    $('#retrainAllButton').show();
  }
  // else if (userStatus === 'admin'){
  //   $('#getSkillsButton').show();
  //   $('#retrainAllButton').hide();
  // }
  else{
    $('#getSkillsButton').show();
    $('.newSkillName').hide();
    $('#retrainAllButton').hide();
  }
}

function listExperts() {
  $('#show-experts').on('click', function(){
    $('#workshop-experts').show();
    $('#show-experts').hide();
  })
}

function listSkills() {
  $('#getSkillsButton').on("click", function(event) {
    event.preventDefault();
    $.ajax({
      url: '/workshops/' + workshopID + '/skills.json',
      success: function(data){
        $(".requiredSkills").show();
        var html = '';
        const dataLength = data.length;
        if (userRole === 'officer') {
          for (let i = 0; i < dataLength; i++){
            var skill = new Skill(data[i])
            html += skill.newOfficerTableRow();
          }
          $('#newSkill').show();
          $("#newSkill").attr('href', '/workshops/' + workshopID + '/skills')
        }
        else {
          for (let i = 0; i < dataLength; i++){
            var skill = new Skill(data[i])
            html += skill.newStaticTableRow();
          }
        }
        $(".currentSkills").html(html);
        $("#getSkillsButton").hide();
        reattachListeners();
      }
    });
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
    var currentSkill = $(this).parent('td').siblings(".currentSkill")
    var currentName = currentSkill.html(); //saves current name before edit
    currentSkill.html("<input type='text' name='skill[name]' value='" + currentName + "'> <button type='button' class='saveName'>Save</button> <button type='button' class='cancel'>Cancel</button>"); //change current name into input field
    currentSkill.children('.saveName').on('click', function() { //submit ajax when save button is clicked.
      var newName = currentSkill.children('input').val();
      $.ajax({
        url: url + '.json',
        type: 'PATCH',
        data: {skill: {name: newName}},
        beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
        success: function(data){
          currentSkill.text(data.name);
        }
      });
    });
    currentSkill.children('.cancel').on('click', function() { //revert to prior name if cancelled
      currentSkill.html(currentName);
    });
  });
}

function newSkill() {
  $('#newSkill').on("click", function(event) {
    event.preventDefault();
    var url = $(this).attr('href');
    $('.newSkillName').html("<input type='text' name='skill[name]'><button type='button' class='createSkill'>Create New Skill</button>");
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
            $('.currentSkills').append(skill.newOfficerTableRow());
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

function retrainAll(){
  $('#retrainAllButton').on("click", function(event){
    event.preventDefault();
    var c = confirm("Requrie all members except Officers and Experts to be re-trained?")
    if (c === true) {
      workshopID = $(this).attr('id');
      var url = $(this).attr('href');
      $.ajax({
        url: url + '.json',
        success: function(shop){
          alert('Everyone except Officers and Experts have been reset.')
        }
      })
    }
  })
}

function showWorkshop() { //load new workshop
  $('.showWorkshop').on("click", function(event) {
    event.preventDefault();
    workshopID = $(this).attr('id');
    var url = $(this).attr('href');
    $.ajax({
      url: url + '.json', //it is cleaner to use an html request and just replace the html in the other pane.
      success: function(data){
        var shop = new Workshop(data);
        workshopID = shop.id
        $('.workshopDiv').attr('id', shop.id); //set shop id
        $('#editWorkshopID').attr('href', '/admin/workshops/' + shop.id + '/edit'); //change edit path
        $('#workshop-name').text(shop.name);
        $('#show-experts').show();
        $('#workshop-experts').hide();
        $('#workshop-experts').text('Experts: ' + shop.listExperts() );
        $('#workshop-officer').text('Officer: ' + shop.officer);
        $(".requiredSkills").hide();
        $('#getSkillsButton').text('Show Workshop Skills');
        $("#getSkillsButton").show();
        $("#retrainAll").attr('href', "/workshops/" + shop.id + "/retrain_all");
        checkUserRole();
      }
    });
  });
}
