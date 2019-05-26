require 'rails_helper'

RSpec.describe InvoiceOption, type: :model do

  describe "Mongoid validations" do 
    it { is_expected.to be_mongoid_document }
    it { is_expected.to be_stored_in(collection: 'invoice_options') }

    it { is_expected.to have_fields(:name, :description, :resource_class, :plan_id, :discount_id).of_type(String) }
    it { is_expected.to have_field(:amount).of_type(Float) }
    it { is_expected.to have_field(:quantity).of_type(Integer) }
    it { is_expected.to have_field(:disabled).of_type(Mongoid::Boolean).with_default_value_of(false) }
    it { is_expected.to have_field(:operation).of_type(String).with_default_value_of('renew=') }
  end 

  describe "ActiveModel validations" do 
    it { is_expected.to validate_numericality_of(:amount) }
    it { is_expected.to validate_numericality_of(:quantity) }
    it { is_expected.to validate_uniqueness_of(:plan_id) }
  end

  it "has a valid factory" do
    expect(build(:invoice_option)).to be_valid
  end

  context "validation" do
    it "validates resource class" do 
      member_io = build(:invoice_option, resource_class: "member")
      other_io = build(:invoice_option, resource_class: "foo")
      rental_io = build(:invoice_option, resource_class: "rental")
      expect(member_io).to be_valid
      expect(rental_io).to be_valid
      expect(other_io).to_not be_valid
    end

    it "validates operation" do 
      renew_io = build(:invoice_option)
      renew_2_io = build(:invoice_option, operation: "renew=")
      other_io = build(:invoice_option, operation: "foo")
      expect(renew_io).to be_valid
      expect(renew_2_io).to be_valid
      expect(other_io).to_not be_valid
    end
  end  

  context "public methods" do
    let(:invoice_option) { build(:invoice_option) }
    let(:member) { create(:member) }
    let(:rental) { create(:rental) }

    describe "build_invoice" do
      it "will not create invoice without member, due date or resource" do 
        expect { invoice_option.build_invoice(nil, nil, nil) }.to raise_error(Mongoid::Errors::Validations)
        expect { invoice_option.build_invoice(member.id, nil, rental.id) }.to raise_error(Mongoid::Errors::Validations)
        expect { invoice_option.build_invoice(member.id, Time.now, nil) }.to raise_error(Mongoid::Errors::Validations)
        expect { invoice_option.build_invoice(nil, Time.now, rental.id) }.to raise_error(Mongoid::Errors::Validations)
      end

      it "builds invoice correctly" do 
        one_mo = Time.now + 1.month
        invoice = invoice_option.build_invoice(member.id, one_mo, member.id)
        expect(invoice).to be_persisted
        expect(invoice.name).to eq(invoice_option.name)
        expect(invoice.amount).to eq(invoice_option.amount)
        expect(invoice.description).to eq(invoice_option.description)
        expect(invoice.resource_class).to eq(invoice_option.resource_class)
        expect(invoice.quantity).to eq(invoice_option.quantity)
        expect(invoice.plan_id).to eq(invoice_option.plan_id)
        expect(invoice.operation).to eq(invoice_option.operation)
        expect(invoice.due_date).to eq(one_mo)
        expect(invoice.member).to eq(member)
        expect(invoice.resource).to eq(member)
      end

      it "can build invoice with discount" do 
        one_mo = Time.now + 1.month
        discount = ::BraintreeService::Discount.standard_membership_discount
        invoice = invoice_option.build_invoice(member.id, one_mo, member.id, discount)
        expect(invoice).to be_persisted
        expect(invoice.amount).to eq(invoice_option.amount - discount.amount)
      end

      it "can build rental or member based invoices" do 
        member_io = build(:invoice_option, resource_class: "member")
        rental_io = build(:invoice_option, resource_class: "rental")
        one_mo = Time.now + 1.month
        member_invoice = member_io.build_invoice(member.id, one_mo, member.id)
        expect(member_invoice).to be_persisted

        rental_invoice = rental_io.build_invoice(member.id, one_mo, rental.id)
        expect(rental_invoice).to be_persisted
      end
    end
  end
end