class MemberMailerPreview < ActionMailer::Preview

  def welcome_email
    MemberMailer.welcome_email(FactoryBot.build(:member).email, "foo.com")
  end

  def member_registered
    MemberMailer.member_registered(FactoryBot.build(:member))
  end

  def request_document
    MemberMailer.request_document("Member Contract", "5e75416c8c8c922957c8c699")
  end
end