class MembersController < ApplicationController
    before_action :set_member, only: [:show]

    def index
        @members = Member.all.sort_by(&:fullname)
        render json: @members
    end

    def show
      # @workshops = Workshop.all.sort_by(&:name)
      render json: @member
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
