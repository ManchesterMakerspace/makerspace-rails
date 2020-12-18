class MemberMailerPreview < ActionMailer::Preview

  def welcome_email
    MemberMailer.welcome_email(Member.last.email || FactoryBot.create(:member).email, "foo.com")
  end

  def member_registered
    MemberMailer.member_registered(Member.last || FactoryBot.create(:member))
  end

  def request_document
    MemberMailer.request_document("Member Contract", (Member.last || FactoryBot.create(:member)).id)
  end
end