$(document).ready(function(){
  role();
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
