class CalendarController < ApplicationController
  before_action :init_service
  before_action :init_notifier

  def index
    @open = @service.list_events(ENV['GOOGLE_CALENDAR'], max_results: 20, time_min: (DateTime.now + 1.day).rfc3339, single_events: true, order_by: 'starttime')
    render json: @open and return
  end

  def update
    @event = @service.get_event(ENV['GOOGLE_CALENDAR'], params[:id])
    new_attendee = Google::Apis::CalendarV3::EventAttendee.new(email: params[:attendee][:email])
    if @event.attendees
      @event.attendees.push(new_attendee)
    else
      @event.attendees = [ new_attendee ]
    end
    if @service.update_event(ENV['GOOGLE_CALENDAR'], @event.id, @event)
        @notifier.ping("Member registered for orientation - #{@event.start.date_time}")
    else
      member = Member.where(email: params[:attendee][:email])
      if member
          @notifier.ping("Error registering member for orientation. Contact #{member.fullname} - #{member.email}")
      else
          @notifier.ping("Unknown registration error from #{member.email}")
      end
    end
      render json: {}, status: 200
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
    if Rails.env.production?
        @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
          channel: 'master_slacker',
          icon_emoji: ':ghost:'
    else
        @notifier = Slack::Notifier.new ENV['SLACK_WEBHOOK_URL'], username: 'Management Bot',
          channel: 'test_channel',
          icon_emoji: ':ghost:'
    end
  end
end
