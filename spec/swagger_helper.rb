require 'rails_helper'
# TODO: The oneOf definitions don't work


RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  # NOTE: If you're using the rswag-api to serve API descriptions, you'll need
  # to ensure that it's configured to serve Swagger from the same folder
  config.swagger_root = Rails.root.to_s + '/swagger'
  config.include Devise::Test::IntegrationHelpers, type: :request
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
        version: 'v1',
      },
      basePath: '/api',
      consumes: ['application/json'],
      produces: ['application/json'],
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
            expirationMonth: { type: :number  },
            expirationYear: { type: :number  },
            expirationDate: { type: :string },
            last4: { type: :number  },
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

        Dispute: {
          type: :object,
          properties: {
            id: { type: :string },
            kind: { type: :string },
            reason: { type: :string },
            createdAt: { type: :string },
            amountDisputed: { type: :number },
            status: { type: :string },
            transaction: { '$ref' => '#/definitions/Transaction' }
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
            status: { type: :number },
            error: { type: :string },
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
            createdAt: { type: :string },
            dueDate: { type: :string },
            amount: { type: :string },
            subscriptionId: { type: :string, 'x-nullable': true },
            planId: { type: :string, 'x-nullable': true },
            resourceClass: { type: :string },
            resourceId: { type: :string },
            quantity: { type: :number },
            discountId: { type: :string, 'x-nullable': true },
            memberName: { type: :string },
            # TODO
            # resource: { 
            #   type: :object,
            #   oneOf: [
            #     '$ref' => '#/definitions/Member',
            #     '$ref' => '#/definitions/Rental'
            #   ]
            # }
          }
        },

        InvoiceOption: {
          type: :object,
          properties: {
            id: { type: :string },
            name: { type: :string },
            description: { type: :string },
            amount: { type: :string },
            planId: { type: :string, 'x-nullable': true },
            resourceClass: { type: :string },
            quantity: { type: :number },
            discountId: { type: :string, 'x-nullable': true },
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
            expirationTime: { type: :number  },
            memberContractOnFile: { type: :boolean },
            cardId: { type: :string, 'x-nullable': true },
            subscriptionId: { type: :string, 'x-nullable': true },
            customerId: { type: :string, 'x-nullable': true },
            earnedMembershipId: { type: :string, 'x-nullable': true },
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
            billingFrequency: { type: :number  },
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
            termStartDate: { type: :string },
            termEndDate: { type: :string },
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
            termStartDate: { type: :string },
            termEndDate: { type: :string },
            satisfied: { type: :boolean }
          }
        },

        Report: {
          type: :object,
          properties: {
            id: { type: :string },
            date: { type: :string },
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
            expiration: { type: :number }
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
            firstBillingDate: { type: :string },
            nextBillingDate: { type: :string },
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
            createdAt: { type: :string },
            customerDetails: { type: :object },
            disputes: { type: :array, items: { '$ref' => '#/definitions/Dispute' } },
            discountAmount: { type: :string },
            discounts: { type: :array, items: { '$ref' => '#/definitions/Discount' } },
            gatewayRejectionReason: { type: :string, 'x-nullable': true },
            status: { type: :string },
            id: { type: :string },
            planId: { type: :string, 'x-nullable': true },
            recurring: { type: :boolean },
            refundIds: { type: :array, items: { type: :string } },
            refundedTransactionId: { type: :string, 'x-nullable': true },
            # TODO
            # subscriptionDetails: { 
            #   type: :object,
            #   properties: {
            #     billingPeriodStartDate: { type: :string },
            #     billingPeriodEndDate: { type: :string },
            #   }
            # },
            subscriptionId: { type: :string, 'x-nullable': true },
            amount: { type: :string },
            memberId: { type: :string },
            memberName: { type: :string },
            # paymentMethodDetails: {
            #   oneOf: [
            #     '$ref' => '#/definitions/CreditCard',
            #     '$ref' => '#/definitions/PayPalAccount',
            #   ]
            # }
          }
        },

      }
    }
  }
end
