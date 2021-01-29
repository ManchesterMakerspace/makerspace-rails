class DocumentsController < AuthenticationController

  def show
    template = resource_params[:id]
    raise ::Error::NotFound.new() unless allowed_documents.include?(template)
    render template: "documents/#{template}", layout: false, locals: get_locals(template)
  end

  private
  def allowed_documents
    Dir["#{Rails.root}/app/views/documents/*.html.erb"].collect { |f| File.basename(f, ".html.erb") }
  end

  def resource_params
    params.require(:id)
    params.permit(:resource_id, :id)
  end

  def get_locals(template)
    case template 
    when "code_of_conduct"
      { member: current_member, signature: nil }
    when "member_contract"
      { member: current_member, signature: nil }
    when "rental_agreement"
      rental = Rental.find(resource_params[:resource_id]) unless resource_params[:resource_id].nil?
      raise ::Error::NotFound.new() if rental.nil?
      { member: current_member, rental: rental, signature: nil }
    end
  end
end