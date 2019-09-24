class DocumentsController < AuthenticationController

  def show
    template = params[:id]
    raise ::Error::NotFound.new() unless allowed_documents.include?(template)
    @member = current_member
    render template: "documents/#{template}"
  end

  private
  def allowed_documents
    Dir["#{Rails.root}/app/views/documents/*.html"].collect { |f| File.basename(f, ".html") }
  end
end