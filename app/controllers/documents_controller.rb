class DocumentsController < AuthenticationController
  include ::Service::GoogleDrive

  def show
    template = resource_params[:id]
    raise ::Error::NotFound.new() unless allowed_documents.include?(template)

    if resource_params[:saved]
      resource = get_resource(template)
      doc = ::Service::GoogleDrive.get_document(resource, template)
      send_file(doc.path)
    else
      render template: "documents/#{template}", layout: false, locals: get_locals(template)
    end

  end

  private
  def allowed_documents
    Dir["#{Rails.root}/app/views/documents/*.html.erb"].collect { |f| File.basename(f, ".html.erb") }
  end

  def resource_params
    params.require(:id)
    params.permit(:resource_id, :id, :saved)
  end

  def get_resource(template)
    case template 
    when "member_contract"
      current_member
    when "rental_agreement"
      rental = Rental.find(resource_params[:resource_id]) unless resource_params[:resource_id].nil?
      raise ::Error::NotFound.new() if rental.nil?
      rental
    end
  end

  def get_locals(template)
    case template 
    when "code_of_conduct"
      { member: current_member, signature: nil }
    when "member_contract"
      { member: current_member, signature: nil }
    when "rental_agreement"
      rental = get_resource(template)
      { member: current_member, rental: rental, signature: nil }
    end
  end
end