class CalendarController < ApplicationController
  before_action :init_service
  before_action :init_notifier

  def index
    @open = @service.list_events(ENV['GOOGLE_CALENDAR'], max_results: 20, q: 'Available', time_min: (DateTime.now + 1.day).rfc3339, single_events: true)
    render json: @open and return
  end

  def update
    @event = @service.get_event(ENV['GOOGLE_CALENDAR'], params[:event][:id])
    if @event.attendees
      @event.attendees.push( Google::Apis::CalendarV3::EventAttendee.new(email: params[:attendee][:email]) )
    else
      @event.attendees = [ Google::Apis::CalendarV3::EventAttendee.new(email: params[:attendee][:email]) ]
    end
    if @service.update_event(ENV['GOOGLE_CALENDAR'], @event.id, @event)
      if Rails.env.production?
        notifier.ping("Member registered for orientation - #{@event.start.date_time}")
      else
        notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
          channel: 'test_channel',
          icon_emoji: ':ghost:'
          notifier.ping("Member registered for orientation - #{@event.start.date_time}")
      end
    else
      member = Member.where(email: params[:attendee][:email])
      if member
        if Rails.env.production?
          @notifier.ping("Error registering member for orientation. Contact #{member.fullname} - #{member.email}")
        else
          notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
            notifier.ping("Error registering member for orientation. Contact #{member.fullname} - #{member.email}")
        end
      else
        if Rails.env.production?
          @notifier.ping("Unknown registration error from #{member.email}")
        else
          notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
            channel: 'test_channel',
            icon_emoji: ':ghost:'
            notifier.ping("Unknown registration error from #{member.email}")
        end
      end
    end
      render json: {status: 200}
  end

  private
  def init_service
    @service = Google::Apis::CalendarV3::CalendarService.new
    creds = Google::Auth::UserRefreshCredentials.new({
      client_id: ENV['GOOGLE_ID'],
      client_secret: ENV['GOOGLE_SECRET'],
      refresh_token: ENV['GOOGLE_TOKEN'],
      scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/drive"]
    })
    @service.authorization = creds
  end
  def init_notifier
    @notifier = notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
      channel: 'master_slacker',
      icon_emoji: ':ghost:'
  end
end
