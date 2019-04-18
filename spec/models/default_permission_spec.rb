require 'rails_helper'

RSpec.describe DefaultPermission, type: :model do

    describe "Mongoid validations" do
      it { is_expected.to be_mongoid_document }
      it { is_expected.to be_stored_in(collection: 'default_permissions') }
      it { is_expected.to have_fields(:name, :enabled) }
    end

    describe "public methods" do
      it "Get list of exiting default permission names" do
        create(:default_permission, name: :bar)
        create(:default_permission, name: :foo, enabled: true)
        create(:default_permission, name: :baz, enabled: true)
        create(:default_permission, name: :foo)
        expect(DefaultPermission.list_permissions).to contain_exactly(:foo, :bar, :baz)
      end
    end
end