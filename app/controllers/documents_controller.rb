class DocumentsController < AuthenticationController

  def show
    template = params[:id]
    raise ::Error::NotFound.new() unless allowed_documents.include?(template)
    render template: "documents/#{template}", layout: false, locals: { member: current_member, signature: nil }
  end

  private
  def allowed_documents
    Dir["#{Rails.root}/app/views/documents/*.html.erb"].collect { |f| File.basename(f, ".html.erb") }
  end
end