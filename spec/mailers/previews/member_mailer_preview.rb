class MemberMailerPreview < ActionMailer::Preview

  def welcome_email
    MemberMailer.welcome_email(FactoryBot.build(:member).email, "foo.com")
  end

  def member_registered
    MemberMailer.member_registered(FactoryBot.build(:member))
  end
end