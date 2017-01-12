var foundMemberId, token;
var member = new Member;

$(document).ready(function(){
  role();
  if (window.location.pathname === '/admin/renew'){
    loadMember();
    showRenewals();
  }
  if (window.location.pathname === '/admin/members/new'){
    scan();
    showNewMembers();
  }
});

function scan() {
  var socket = io.connect('http://localhost:4000');
  socket.on('regMember', function (data) {
    $('#member_cardID').val(data.cardID);
  });
}

function role() {
  $('.role').on('change', function() {
    var role = $('#member_role').val();
    //require new login credentials if new member role is admin or officer
    if (role === 'admin' || role === 'officer'){
      $('.login').show();
    } else {
      $('.login').hide();
    }
  })
};

function clearForm(form) {
  // iterate over all of the inputs for the form element that was passed in
  $(':input', form).each(function() {
    var type = this.type;
    var tag = this.tagName.toLowerCase(); // normalize case
    // it's ok to reset the value attr of text inputs, password inputs, and textareas
    if (type == 'text' || type == 'password' || tag == 'textarea')
      this.value = "";
    // checkboxes and radios need to have their checked state cleared but should *not* have their 'value' changed
    else if (type == 'checkbox' || type == 'radio')
      this.checked = false;
    // select elements need to have their 'selectedIndex' property set to 0
    else if (tag == 'select')
      this.selectedIndex = 0;
  });
};

function loadMember() {
  $('.member').on('change', function(){
    var member_fullname = $('#member_fullname').val();
    token = $('input[name=authenticity_token]').val();
		//post to members#search_by to retrieve member info
    $.post('/members/search_by.json', { field: 'fullname', value: member_fullname, authenticity_token: token }, function(data){
      if (data.length === 1){
				foundMemberId = data[0]["_id"]["$oid"];
        member.fullname = data[0]["fullname"];
				member.expirationTime = data[0]["expirationTime"];
        $('.member-name').text('Member Name: ' + member.fullname);
        $('.member-expTime').text('Membership expires on ' + member.formatExpTime());
      }
      else if (data.length > 1){
        alert('Multiple members found')
      }
    });
  });
}

//update member on submit and append updated member to bottom of page.
function showRenewals() {
	$('input[type="submit"][value="Renew Member"]').click(function(event){
		if (typeof foundMemberId != 'undefined'){
			var months = $('input[name="member[expirationTime]"]').val();
			$.ajax({
				url: '/admin/members/' + foundMemberId + '.json',
				type: 'PUT',
				data: {member: {expirationTime: months}, authenticity_token: token },
				success: function(data) {
					member.expirationTime = data["expirationTime"]
					alert(member.fullname + ' updated. New expiration: ' + member.formatExpTime());
					$('.renewedMembers').show();
					$('.renewedMembers').append("<li> Name: <strong>" + member.fullname + "</strong> <ul>Renewed for: <strong> " + months + " months </strong></ul><ul> New Expiration Date: <strong>" + member.formatExpTime() + "</strong> </ul></li>")
					//reset form after update
					clearForm($('.renew'));
					$('.member-name').text('');
					$('.member-expTime').text('');
				}
			});
			event.preventDefault();
		}
		else {
			alert("You must select a member first")
			event.preventDefault();
		}
	})
}

function showNewMembers() {
  var newMember = new Member;
  $('input[type="submit"][value="Create Member"]').click(function(event){
    newMember.fullname = $('#member_fullname').val();
    newMember.cardID = $('#member_cardID').val();
    newMember.role = $('#member_role').val();
    newMember.cardID = $('#member_email').val();
    newMember.cardID = $('#member_password').val();
    newMember.cardID = $('#member_expirationTime').val();
  });
}
