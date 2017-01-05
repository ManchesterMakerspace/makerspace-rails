$(document).ready(function(){
  role();
  member_id();
});

function role() {
  $('.role').on('change', function() {
    var role = $('#member_role').val();
    if (role === 'admin' || role === 'officer'){
      $('.login').show();
    } else {
      $('.login').hide();
    }
  })
};

function member_id() {
  $('.member').on('change', function(){
    var member_id = $('#member_id').val();
    $('.renew').attr("action", "/admin/members/" + member_id);
  })
}
