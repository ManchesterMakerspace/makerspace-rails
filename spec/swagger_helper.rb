require 'rails_helper'
# TODO: The oneOf definitions don't work


RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.swagger_root = Rails.root.to_s + '/swagger'

  # Define one or more Swagger documents and provide global metadata for each one
  # When you run the 'rswag:specs:to_swagger' rake task, the complete Swagger will
  # be generated at the provided relative path under swagger_root
  # By default, the operations defined in spec files are added to the first
  # document below. You can override this behavior by adding a swagger_doc tag to the
  # the root example_group in your specs, e.g. describe '...', swagger_doc: 'v2/swagger.json'
  config.swagger_docs = {
    'v1/swagger.json' => {
      swagger: '2.0',
      info: {
        title: 'Makerspace Server V1',
        version: 'v1'
      },
      definitions: {
        Card: {
          type: :object,
          properties: {
            id: { type: :string },
            holder: { type: :string },
            expiry: { type: :number },
            validity: { type: :string },
            uid: { type: :string },
          }
        },

        CreditCard: {
          type: :object,
          properties: {
            customerId: { type: :string },
            imageUrl: { type: :string },
            subscriptions: {
              type: :array,
              items: { '$ref' => '#/definitions/Subscription' }
            },
            cardType: { type: :string },
            expirationMonth: { type: :string },
            expirationYear: { type: :string },
            expirationDate: { type: :string },
            last4: { type: :string },
          }
        },

        Discount: {
          type: :object,
          properties: {
            id: { type: :string },
            name: { type: :string },
            description: { type: :string },
            amount: { type: :string }
          }
        },

        EarnedMembership: {
          type: :object,
          properties: {
            id: { type: :string },
            memberId: { type: :string },
            memberName: { type: :string },
            memberStatus: { type: :string },
            memberExpiration: { type: :number },
            requirements: {
              type: :array,
              items: { '$ref' => '#/definitions/Requirement' }
            }
          }
        },

        error: {
          type: :object,
          properties: {
            message: { type: :string },
            code: { type: :number },
            status: { type: :string },
          }
        },

        Invoice: {
          type: :object,
          properties: {
            id: { type: :string },
            name: { type: :string },
            description: { type: :string },
            settled: { type: :boolean },
            pastDue: { type: :boolean },
            createdAt: { type: :date },
            dueDate: { type: :date },
            amount: { type: :string },
            subscriptionId: { type: :string },
            planId: { type: :string },
            resourceClass: { type: :string },
            resourceId: { type: :string },
            quantity: { type: :number },
            discountId: { type: :string },
            memberName: { type: :string },
            resource: { 
              type: :object,
              oneOf: [
                '$ref' => '#/definitions/Member',
                '$ref' => '#/definitions/Rental'
              ]
            }
          }
        },

        InvoiceOption: {
          type: :object,
          properties: {
            id: { type: :string },
            name: { type: :string },
            description: { type: :string },
            amount: { type: :string },
            planId: { type: :string },
            resourceClass: { type: :string },
            quantity: { type: :number },
            discountId: { type: :string },
            disabled: { type: :boolean },
          }
        },

        Member: {
          type: :object,
          properties: {
            id: { type: :string },
            firstname: { type: :string },
            lastname: { type: :string },
            email: { type: :string },
            status: { type: :string },
            role: { type: :string },
            expirationTime: { type: :integer },
            memberContractOnFile: { type: :boolean },
            cardId: { type: :string },
            subscriptionId: { type: :string },
            customerId: { type: :string },
            earnedMembershipId: { type: :string },
          }
        },
        
        PayPalAccount: {
          type: :object,
          properties: {
            customerId: { type: :string },
            imageUrl: { type: :string },
            subscriptions: {
              type: :array,
              items: { '$ref' => '#/definitions/Subscription' }
            },
            email: { type: :string },
          }
        },

        # permission: {
        #   type: :object,
        #   properties: {
            
        #   }
        # },

        Plan: {
          type: :object,
          properties: {
            id: { type: :string },
            name: { type: :string },
            description: { type: :string },
            amount: { type: :string },
            billingFrequency: { type: :string },
            discounts: {
              type: :array,
              items: {
                properties: {
                  id: { type: :string },
                  name: { type: :string },
                  description: { type: :string },
                  amount: { type: :string },
                }
              }
            }
          }
        },

        Requirement: {
          type: :object,
          properties: {
            id: { type: :string },
            earnedMembershipId: { type: :string },
            name: { type: :string },
            rolloverLimit: { type: :number },
            termLength: { type: :number },
            targetCount: { type: :number },
            strict: { type: :boolean },
            currentCount: { type: :number },
            termStartDate: { type: :date },
            termEndDate: { type: :date },
            termId: { type: :string },
            satisfied: { type: :boolean }
          }
        },

        ReportRequirement: {
          type: :object,
          properties: {
            id: { type: :string },
            requirementId: { type: :string },
            reportedCount: { type: :number },
            appliedCount: { type: :number },
            currentCount: { type: :number },
            memberIds: {
              type: :array,
              items: {
                type: :string
              }
            },
            termStartDate: { type: :date },
            termEndDate: { type: :date },
            satisfied: { type: :boolean }
          }
        },

        Report: {
          type: :object,
          properties: {
            id: { type: :string },
            date: { type: :date },
            earnedMembershipId: { type: :string },
            reportRequirements: {
              type: :array,
              items: { '$ref' => '#/definitions/EarnedMembership' }
            }
          }
        },

        Rental: {
          type: :object,
          properties: {
            id: { type: :string },
            number: { type: :string },
            description: { type: :string },
            memberName: { type: :string },
            memberId: { type: :string },
            expiration: { type: :date }
          }
        },

        Subscription: {
          type: :object,
          properties: {
            id: { type: :string },
            planId: { type: :string },
            status: { type: :string },
            amount: { type: :string },
            failureCount: { type: :number },
            daysPastDue: { type: :number },
            billingDayOfMonth: { type: :string },
            firstBillingDate: { type: :date },
            nextBillingDate: { type: :date },
            memberId: { type: :string },
            memberName: { type: :string },
            resourceClass: { type: :string },
            resourceId: { type: :string },
            paymentMethodToken: { type: :string }
          }
        },
       

        Transaction: {
          type: :object,
          properties: {
            createdAt: { type: :date },
            customerDetails: { type: :object },
            disputes: { type: :array },
            discountAmount: { type: :string },
            discounts: { type: :array },
            gatewayRejectionReason: { type: :string },
            status: { type: :string },
            id: { type: :string },
            planId: { type: :string },
            recurring: { type: :boolean },
            refundIds: { type: :array, items: { type: :string } },
            refundedTransactionId: { type: :string },
            subscriptionDetails: { 
              type: :object,
              properties: {
                billingPeriodStartDate: { type: :date },
                billingPeriodEndDate: { type: :date },
              }
            },
            subscriptionId: { type: :string },
            amount: { type: :string },
            memberId: { type: :string },
            memberName: { type: :string },
            paymentMethodDetails: {
              oneOf: [
                '$ref' => '#/definitions/CreditCard',
                '$ref' => '#/definitions/PayPalAccount',
              ]
            }
          }
        },

      }
    }
  }
end
