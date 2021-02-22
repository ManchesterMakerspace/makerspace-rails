class SlackMessagesJob < ApplicationJob
  include Service::SlackConnector
  retry_on StandardError

  queue_as :slack

  def perform(request_id)
    message_payloads = get_enqueued_messages("#{request_id}.*")
    messages_per_channel = message_payloads.group_by { |key, payload| JSON.load(payload)["channel"] }
    messages_per_channel.each do |channel, payloads|
      messages = []
      keys = []
      payloads.sort_by { |key, payload| Time.parse(JSON.load(payload)["timestamp"]) }.each do |key, payload|
        parsed_payload = JSON.load(payload)
        messages.push(parsed_payload["message"])
        keys.push(key)
      end
      send_slack_messages(messages, channel)
      Redis.current.del(*keys)
    end
  end
end
