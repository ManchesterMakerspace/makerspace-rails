desc "This task is called by the Heroku scheduler add-on and reviews membership statuses."
task :invoice_review => :environment do
  channel = ::Service::SlackConnector.treasurer_channel

  begin
    created_this_week = Invoice.where(:created_at.gt => Time.now - 1.week)
    earned_this_week = Invoice.where(:settled_at.gt => Time.now - 1.week)
    past_due = Invoice.where(:due_date.lt => Time.now, settled_at: nil, transaction_id: nil)
    refunds_pending = Invoice.where(refunded: false, :refunded_requested.ne => nil)
    pending_settlement = Invoice.where(settled_at: nil, :transaction_id.ne => nil)

    def build_member_url(member)
      base_url = ActionMailer::Base.default_url_options[:host]
      "<#{base_url}/members/#{member.id}|#{member.fullname}>"
    end

    def reduce_amt(invoices)
      invoices.map(&:amount).reduce(:+) || 0
    end

    messages = [
      "--- Invoice Review Notification ---",
      "Number of invoices CREATED this week: #{created_this_week.length} | $#{reduce_amt(created_this_week)}",
      "Number of invoices SETTLED this week: #{earned_this_week.length} | $#{reduce_amt(earned_this_week)}",
      "Number of invoices PAST DUE: #{past_due.length} | $#{reduce_amt(past_due)}",
    ]

    if past_due.length > 0
      messages.concat(["Members with past due invoices:"]).concat(past_due.map { |invoice| build_member_url(invoice.member) })
    end

    if pending_settlement.length > 0
      messages.concat(["Members with invoices paid but not settled:"]).concat(pending_settlement.map { |invoice| build_member_url(invoice.member) })
    end

    if refunds_pending.length > 0
      messages.concat(["Members who need response to their refund requests:"]).concat(refunds_pending.map { |invoice| build_member_url(invoice.member) })
    end

    ::Service::SlackConnector.send_slack_messages(messages, channel)

  rescue => e
    error = "#{e.message}\n#{e.backtrace.inspect}"
    ::Service::SlackConnector.send_slack_message(error, channel)
    raise e
  end
end
