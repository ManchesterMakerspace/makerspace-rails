require 'rails_helper'

RSpec.describe SlackMessagesJob, type: :job do 
  include ActiveJob::TestHelper

  let(:target_id) { "foobar" }

  before(:each) do 
    Service::SlackConnector.enque_message("Message1", nil, "fizzbuzz.method")
    sleep 1
    Service::SlackConnector.enque_message("Message2", nil, "#{target_id}.method")
    sleep 1
    Service::SlackConnector.enque_message("Message3", nil, "#{target_id}.method2")
  end

  after(:each) do 
    Redis.current.flushall
  end

  it "Dispatches slack messages from Redis cache by request_id" do
    expect_any_instance_of(Service::SlackConnector).to receive(:send_slack_messages).with(["Message2", "Message3"], nil)
    SlackMessagesJob.perform_now(target_id)
  end

  it "Removes enqueued messages when sent successfully" do
    SlackMessagesJob.perform_now(target_id)
    expect(Redis.current.get("#{target_id}.method")).to be(nil)
    expect(Redis.current.get("#{target_id}.method2")).to be(nil)
  end

  it "Retains enqueued messages when sent failed" do 
    allow_any_instance_of(Service::SlackConnector).to receive(:send_slack_messages).and_throw("Error")
    SlackMessagesJob.perform_now(target_id)
    expect(Redis.current.get("#{target_id}.method")).to be_truthy
    expect(Redis.current.get("#{target_id}.method2")).to be_truthy
  end

  it "Retries failed messages" do 
    call_count = 0
    allow_any_instance_of(Service::SlackConnector).to receive(:send_slack_messages) do 
      call_count += 1
      if call_count == 1
        raise StandardError
      end
    end
    perform_enqueued_jobs do 
      SlackMessagesJob.perform_now(target_id) rescue nil
    end
    expect(Redis.current.get("#{target_id}.method")).to be(nil)
    expect(Redis.current.get("#{target_id}.method2")).to be(nil)
  end
end
