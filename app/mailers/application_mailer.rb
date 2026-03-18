class ApplicationMailer < ActionMailer::Base
  default from: 'contact@manchestermakerspace.org', bcc: 'renewals@manchestermakerspace.org'
  layout 'mailer'
end
