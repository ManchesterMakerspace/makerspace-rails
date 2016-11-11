class MembersController < ApplicationController
    def index
        @members = Member.all
    end

    def show
        @member = Member.find(params[:id])
    end

    def new
        @member = Member.new
    end

    def create
        @member = Member.new(member_params)

        if @member.save
            redirect_to member_path, notice: "Member created" and return
        end

        render 'new'
    end

    def edit
        @member = Member.find(params[:id])
    end

    def update
        @member = Member.find(params[:id])

        if @member.update_attributes(member_params)
            redirect_to member_path, notice: "#{@member.fullname} was updated" and return
        end

        render 'show'
    end

    def destroy
      @member = Member.find(params[:id])
      @member.destroy

      redirect_to member_path, notice: "#{@member.fullname}  has been deleted!" and return
    end

    def search_by
        @members = []
        Member.where(params[:field] => params[:value]).each do |member|
            @members << member
        end
        render 'index'
    end

    private
    def member_params
      params.require(:member).permit(:fullname, :cardID, :status)
    end
end
