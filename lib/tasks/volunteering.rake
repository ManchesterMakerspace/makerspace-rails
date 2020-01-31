namespace :volunteering do 
  desc "This task updates active/inactive status for all current and former members every day"
  task :update_activity => :environment do  
    begin
      right_now = Time.now.utc
      active_members = Member.where(expirationTime: { "$gte" => (right_now.to_i * 1000) }, status: "activeMember").pluck(:id)
      MembershipSnapshot.create!(date: right_now.to_date, active_members: active_members)
      ::Service::SlackConnector.send_slack_message("Membership snapshot saved. We have #{active_members.size} active members", ::Service::SlackConnector.logs_channel)
    rescue => e
      error = "#{e.message}\n#{e.backtrace.inspect}"
      ::Service::SlackConnector.send_slack_message(error, ::Service::SlackConnector.logs_channel)
      raise e
    end
  end

  # Every month active, add 1 to requirement count, but cannot exceed the MAX_MONTHLY_REQUIREMENT 
  desc "This task updates required and completed volunteer credits at the end of every month"
  task :evaluate_requirements => :environment do 
    activity_threshold = 21

    # Run it on last day of month
    should_run = Rails.env.production? ? Time.now.utc.to_date == Time.now.utc.end_of_month.to_date : true

    if should_run
      begin
        volunteer_spreadsheet = ::Service::GoogleDrive::Volunteering.new
        # Collect IDs of all active members
        active_ids = MembershipSnapshot.get_active_month.pluck(:active_members).flatten
        active_for_month = active_ids.uniq.select { |member_id| active_ids.count(member_id) > activity_threshold }
        
        active_for_month.map do |member_id| 
          volunteer_spreadsheet.update_requirement_count(member_id) 
        end
      ::Service::SlackConnector.send_slack_message("Volunteering requirements updated.", ::Service::SlackConnector.logs_channel)
    rescue => e
        error = "#{e.message}\n#{e.backtrace.inspect}"
        ::Service::SlackConnector.send_slack_message(error, ::Service::SlackConnector.logs_channel)
        raise e
      end
    end

    desc "This task updates member eligibility for volunteer dates every month"
    task :evaluate_eligibility => :environment do 
      # Run it on last day of month
      should_run = Rails.env.production? ? Time.now.utc.to_date == Time.now.utc.end_of_month.to_date : true

      if should_run
        begin
          volunteer_spreadsheet = ::Service::GoogleDrive::Volunteering.new
          Member.pluck(:id).map do |member_id|
            volunteer_spreadsheet.update_eligibility(member_id) 
          end
        ::Service::SlackConnector.send_slack_message("Volunteering eligibility updated.", ::Service::SlackConnector.logs_channel)
        rescue => e
          error = "#{e.message}\n#{e.backtrace.inspect}"
          ::Service::SlackConnector.send_slack_message(error, ::Service::SlackConnector.logs_channel)
          raise e
        end
      end
    end
  end
end
