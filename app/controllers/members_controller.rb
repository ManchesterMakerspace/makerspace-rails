class MembersController < ApplicationController
    before_action :set_member, only: [:show]

    def index
      @members = Member.all.sort_by(&:fullname)
      if current_member.try(:role) != 'admin'
        @members = @members.select do |m|
          Time.at(m.expirationTime/1000) - Time.now > 0
        end
      end
      render json: @members and return
    end

    def show
      # @workshops = Workshop.all.sort_by(&:name)
      render json: @member and return
    end

    def contract
      session = GoogleDrive::Session.from_config("config.json")
      drive_file = session.file_by_id(ENV['CONTRACT_ID'])
      pdf_file = Tempfile.new(['contract', '.pdf'])
      drive_file.download_to_file(pdf_file.path)
      png_file = Tempfile.new(['contract', '.png'])
      image = MiniMagick::Image.open(pdf_file.path)
      image.format "png"
      image.write(png_file.path)
      pdf_file.unlink
      data = Base64.encode64(image.to_blob).gsub("\n", '')
      render json: {contract: "data:image/png;base64,#{data}"} and return
    end

    # def mailer
    #     @members = Member.all
    #     @members.each { |member| member.membership_mailer }
    #     redirect_to members_path
    # end

    private
    # def member_params
    #   params.require(:member).permit(:fullname, :email, :learned_skill_ids =>[])
    # end

    def set_member
      @member = Member.find(params[:id])
    end
end
