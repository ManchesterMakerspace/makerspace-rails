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
