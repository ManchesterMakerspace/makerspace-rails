class MembersController < ApplicationController
    before_action :set_member, only: [:show]

    def index
        @members = Member.all.sort_by(&:fullname)
        respond_to do |format|
          format.html { render :index }
          format.json { render json: @members }
        end
    end

    def show
      @workshops = Workshop.all.sort_by(&:name)
      respond_to do |format|
        format.html { render :show }
        format.json { render json: @member }
      end
    end

    def search_by
        if params[:value].empty?
          respond_to do |format|
            format.html { render :index }
            format.json { render :json, alert: 'Value missing' }
          end
        else
          @members = Member.where(params[:field] => params[:value])
          respond_to do |format|
            format.html { render :index}
            format.json { render json: @members  }
          end
        end
    end

    def mailer
        @members = Member.all
        @members.each { |member| member.membership_mailer }
        redirect_to members_path
    end

    private
    def member_params
      params.require(:member).permit(:fullname, :email, :learned_skill_ids =>[])
    end

    def set_member
      @member = Member.find(params[:id])
    end
end
