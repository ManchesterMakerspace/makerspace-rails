class DocumentUploadJob < ApplicationJob
  include Service::SlackConnector
  include ::Service::GoogleDrive
  retry_on StandardError

  queue_as :slack

  def perform(base64_signature, document_type, resource_id)
    if document_type == "member_contract"
      resource = Member.find(resource_id)
      member = resource 
      overloads = {}

      def onFail()
        resource.update_attributes!(member_contract_signed_date: nil)
      end

    elsif document_type == "rental_agreement"
      resource = Rental.find(resource_id)
      member = resource.member
      overloads = { rental: resource }

      def onFail()
        resource.update_attributes!(contract_on_file: false)
      end
    end

    begin
      document = upload_document(document_type, member, overloads, base64_signature)
      MemberMailer.send_document(document_type, member.id.as_json, document).deliver_later
    rescue Error::Google::Upload => err
      enque_message("Error uploading #{@member.fullname}'s #{document_type} signature'. Error: #{err}")
      onFail()
    end
  end
end
