require 'rails_helper'

RSpec.describe Permission, type: :model do

    describe "Mongoid validations" do
      it { is_expected.to be_mongoid_document }
      it { is_expected.to be_stored_in(collection: 'permissions') }
      it { is_expected.to have_fields(:name, :enabled) }
      it { is_expected.to belong_to(:member) }
    end

    describe "public methods" do
      it "Get list of exiting permission names" do
        create(:permission, name: :bar)
        create(:permission, name: :foo, enabled: true)
        create(:permission, name: :baz, enabled: true)
        create(:permission, name: :foo)
        expect(Permission.list_permissions).to contain_exactly(:foo, :bar, :baz)
      end
    end
end