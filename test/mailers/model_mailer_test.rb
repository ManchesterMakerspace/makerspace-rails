require 'test_helper'

class ModelMailerTest < ActionMailer::TestCase
  test "expired_member_notification" do
    mail = ModelMailer.expired_member_notification
    assert_equal "Expired member notification", mail.subject
    assert_equal ["to@example.org"], mail.to
    assert_equal ["from@example.com"], mail.from
    assert_match "Hi", mail.body.encoded
  end

end
