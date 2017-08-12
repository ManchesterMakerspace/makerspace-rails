class GroupsController < ApplicationController
    before_action :set_group, only: [:show]

    def index
      @groups = Group.all.sort_by(&:groupName)
      render json: @groups
    end

    def show
      render json: @group
    end

    private
    def set_member
      @group = Group.find(params[:id])
    end
end
