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
      produces: ['application/json', 'text/html'],
      definitions: {
        Card: {
          type: :object,
          properties: {
            id: { type: :string },
            holder: { type: :string },
            expiry: { type: :number },
            validity: {
              type: :string,
              enum: ["activeMember", "expired", "inactive", "lost", "nonMember", "revoked", "stolen"]
            },
            uid: { type: :string },
          }
        },

        CreditCard: {
          type: :object,
          properties: {
            id: { type: :string },
            default: { type: :boolean },
            paymentType: { type: :string, 'x-nullable': true },
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
            debit: { type: :boolean },
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

        NewEarnedMembership: {
          type: :object,
          properties: {
            memberId: { type: :string },
            requirements: {
              type: :array,
              items: { '$ref' => '#/definitions/NewRequirement' }
            }
          }
        },
        EarnedMembership: {
          type: :object,
          properties: {
            id: { type: :string },
            memberId: { type: :string },
            memberName: { type: :string },
            memberStatus: { type: :string, enum: ["activeMember", "inactive", "nonMember", "revoked"] },
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
            transactionId: { type: :string, 'x-nullable': true },
            planId: { type: :string, 'x-nullable': true },
            resourceClass: { type: :string, enum: ["member", "rental"] },
            resourceId: { type: :string },
            quantity: { type: :number },
            discountId: { type: :string, 'x-nullable': true },
            memberName: { type: :string },
            memberId: { type: :string },
            refunded: { type: :boolean },
            refundRequested: { type: :string, 'x-nullable': true },
            operation: { type: :string },
            # TODO
            member: { type: :object, 'x-nullable': true, properties: { '$ref' => '#/definitions/Member' } },
            rental: { type: :object, 'x-nullable': true, properties: { '$ref' => '#/definitions/Rental' } },
            # resource: {
            #   type: :object,
            #   oneOf: [
            #     '$ref' => '#/definitions/Member',
            #     '$ref' => '#/definitions/Rental'
            #   ]
            # }
          }
        },

        NewInvoiceOption:  {
          type: :object,
          properties: {
            name: { type: :string },
            description: { type: :string },
            amount: { type: :string },
            planId: { type: :string, 'x-nullable': true },
            resourceClass: { type: :string },
            quantity: { type: :number },
            discountId: { type: :string, 'x-nullable': true },
            disabled: { type: :boolean },
            isPromotion: { type: :boolean },
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
            operation: { type: :string },
            isPromotion: { type: :boolean },
          }
        },

        NewMember: {
          type: :object,
          properties: {
            firstname: { type: :string },
            lastname: { type: :string },
            email: { type: :string },
            status: { type: :string, enum: ["activeMember", "inactive", "nonMember", "revoked"] },
            role: { type: :string, enum: ["admin", "member"] },
            memberContractOnFile: { type: :boolean },
            phone: { type: :string },
            address: {
              type: :object,
              properties: {
                street: { type: :string },
                unit: { type: :string,  'x-nullable': true },
                city: { type: :string },
                state: { type: :string },
                postalCode: { type: :string },
              }
            }
          }
        },
        Member: {
          type: :object,
          properties: {
            id: { type: :string },
            firstname: { type: :string },
            lastname: { type: :string },
            email: { type: :string },
            status: { type: :string, enum: ["activeMember", "inactive", "nonMember", "revoked"] },
            role: { type: :string, enum: ["admin", "member"] },
            expirationTime: { type: :number, 'x-nullable': true },
            memberContractOnFile: { type: :boolean },
            cardId: { type: :string, 'x-nullable': true },
            subscriptionId: { type: :string, 'x-nullable': true },
            subscription: { type: :boolean },
            customerId: { type: :string, 'x-nullable': true },
            earnedMembershipId: { type: :string, 'x-nullable': true },
            notes: { type: :string, 'x-nullable': true },
            phone: { type: :string, 'x-nullable': true },
            address: {
              type: :object,
              properties: {
                street: { type: :string, 'x-nullable': true },
                unit: { type: :string, 'x-nullable': true },
                city: { type: :string, 'x-nullable': true },
                state: { type: :string, 'x-nullable': true },
                postalCode: { type: :string, 'x-nullable': true },
              }
            }
          }
        },

        PayPalAccount: {
          type: :object,
          properties: {
            id: { type: :string },
            default: { type: :boolean },
            paymentType: { type: :string, 'x-nullable': true },
            customerId: { type: :string },
            imageUrl: { type: :string },
            subscriptions: {
              type: :array,
              items: { '$ref' => '#/definitions/Subscription' }
            },
            email: { type: :string },
          }
        },

        Plan: {
          type: :object,
          properties: {
            id: { type: :string },
            name: { type: :string },
            type: { 
              type: :string,
              enum: ["membership", "rental"]
            },
            description: { type: :string },
            amount: { type: :string },
            billingFrequency: { type: :number  },
            discounts: {
              type: :array,
              items: {
                type: :object,
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

        NewRequirement: {
          type: :object,
          properties: {
            name: { type: :string },
            rolloverLimit: { type: :number },
            termLength: { type: :number },
            targetCount: { type: :number },
            strict: { type: :boolean },
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

        NewReportRequirement: {
          type: :object,
          properties: {
            requirementId: { type: :string },
            reportedCount: { type: :number },
            memberIds: {
              type: :array,
              items: {
                type: :string
              }
            },
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

        NewReport: {
          type: :object,
          properties: {
            earnedMembershipId: { type: :string },
            reportRequirements: {
              type: :array,
              items: { '$ref' => '#/definitions/NewReportRequirement' }
            }
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
              items: { '$ref' => '#/definitions/ReportRequirement' }
            }
          }
        },

        NewRental: {
          type: :object,
          properties: {
            number: { type: :string },
            description: { type: :string },
            memberId: { type: :string },
            expiration: { type: :number },
            contractOnFile: { type: :boolean }
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
            expiration: { type: :number },
            subscriptionId: { type: :string, 'x-nullable': true },
            contractOnFile: { type: :boolean },
            notes: { type: :string, 'x-nullable': true },
          }
        },

        Subscription: {
          type: :object,
          properties: {
            id: { type: :string },
            planId: { type: :string },
            status: { 
              type: :string,
              enum: [
                "Active",
                "Canceled",
                "Past Due",
                "Pending",
                "Expired"
              ]
            },
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
            status: { 
              type: :string,
              enum: [
                "authorization_expired",
                "authorized",
                "authorizing",
                "settlement_pending",
                "settlement_declined",
                "failed",
                "gateway_rejected",
                "processor_declined",
                "settled",
                "settling",
                "submmitted_for_settlement",
                "voided"
              ]
            },
            id: { type: :string },
            planId: { type: :string, 'x-nullable': true },
            recurring: { type: :boolean },
            refundIds: { type: :array, items: { type: :string } },
            refundedTransactionId: { type: :string, 'x-nullable': true },
            subscriptionDetails: {
              type: :object,
              properties: {
                billingPeriodStartDate: { type: :string, 'x-nullable': true },
                billingPeriodEndDate: { type: :string, 'x-nullable': true },
              },
            },
            subscriptionId: { type: :string, 'x-nullable': true },
            amount: { type: :string },
            memberId: { type: :string },
            memberName: { type: :string },
            invoice: { '$ref' => '#/definitions/Invoice', 'x-nullable': true },
            # TODO
            creditCardDetails: { type: :object, properties: { '$ref' => '#/definitions/CreditCard' }, 'x-nullable': true },
            paypalDetails: { type: :object, properties: { '$ref' => '#/definitions/PayPalAccount' }, 'x-nullable': true },
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
