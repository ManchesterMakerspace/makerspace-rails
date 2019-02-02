module GoogleService
  extend ActiveSupport::Concern
  include Service::GoogleDrive

  included do
    before_action :initalize_gdrive
  end

  def initalize_gdrive
    @google = self.load_gdrive
  end
end