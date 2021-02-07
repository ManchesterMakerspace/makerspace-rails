desc "This task is called by the Heroku scheduler add-on and reviews invoice statuses."
task :invoice_review => :environment do
  channel = ::Service::SlackConnector.treasurer_channel
  should_run = Rails.env.production? ? !!Date.today.sunday? : true

  # Only run this task on Sundays
  if should_run
    begin
      created_this_week = Service::Analytics::Invoices.query_created(1.week)
      earned_this_week = Service::Analytics::Invoices.query_earned(1.week)
      past_due = Service::Analytics::Invoices.query_past_due()
      refunds_pending = Service::Analytics::Invoices.query_refunds_pending()
      pending_settlement = Service::Analytics::Invoices.query_settlement_pending()

      def build_member_url(member_id)
        base_url = ActionMailer::Base.default_url_options[:host]
        member = Member.find(member_id)
        "<#{base_url}/members/#{member.id}|#{member.fullname}>"
      end

      def build_member_list(invoice_list)
        uniq_members = invoice_list.distinct(:member_id)
        uniq_members.map do |member_id|
          invoice_count = invoice_list.where(member_id: member_id).size
          url = build_member_url(member_id)

          if invoice_count > 1
            url += " (#{invoice_count})"
          end

          url
        end
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
        messages.concat(["Members with past due invoices:"]).concat(build_member_list(past_due))
      end

      if pending_settlement.length > 0
        messages.concat(["Members with invoices paid but not settled:"]).concat(build_member_list(pending_settlement))
      end

      if refunds_pending.length > 0
        messages.concat(["Members who need response to their refund requests:"]).concat(build_member_list(refunds_pending))
      end

      ::Service::SlackConnector.send_slack_messages(messages, channel)

    rescue => e
      error = "#{e.message}\n#{e.backtrace.inspect}"
      ::Service::SlackConnector.send_slack_message(error, ::Service::SlackConnector.logs_channel)
      raise e
    end
  end
end
