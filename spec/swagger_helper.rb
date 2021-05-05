require 'rails_helper'

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

  definitions = {
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
      },
      required: [:id, :holder, :expiry, :validity, :uid]
    },
    RejectionCard: {
      type: :object,
      properties: { uid: { type: :string } },
      required: [:uid]
    },

    CreditCard: {
      type: :object,
      properties: {
        id: { type: :string },
        isDefault: { type: :boolean },
        paymentType: { type: :string },
        customerId: { type: :string },
        imageUrl: { type: :string },
        subscriptions: {
          type: :array,
          items: { '$ref' => '#/components/schemas/Subscription' }
        },
        cardType: { type: :string },
        expirationMonth: { type: :number  },
        expirationYear: { type: :number  },
        expirationDate: { type: :string },
        last4: { type: :number  },
        debit: { type: :boolean },
      },
      required: [
        :id,
        :isDefault,
        :customerId,
        :imageUrl,
        :subscriptions,
        :cardType,
        :expirationMonth,
        :expirationYear,
        :expirationDate,
        :last4,
        :debit
      ]
    },

    Discount: {
      type: :object,
      properties: {
        id: { type: :string },
        name: { type: :string },
        description: { type: :string },
        amount: { type: :string }
      },
      required: [:id, :name, :description, :amount]
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
        transaction: { '$ref' => '#/components/schemas/Transaction' }
      },
      required: [
        :id,
        :kind,
        :reason,
        :createdAt,
        :amountDisputed,
        :status,
        :transaction
      ]
    },

    NewEarnedMembership: {
      type: :object,
      properties: {
        memberId: { type: :string },
        requirements: {
          type: :array,
          items: { '$ref' => '#/components/schemas/NewRequirement' }
        },
      },
      required: [:memberId, :requirements]
    },
    EarnedMembership: {
      allOf: [
        { '$ref' => '#/components/schemas/NewEarnedMembership' },
        {
          type: :object,
          properties: {
            id: { type: :string },
            memberName: { type: :string },
            memberStatus: { '$ref': '#/components/schemas/MemberStatus' },
            memberExpiration: { type: :number },
            requirements: {
              type: :array,
              items: { '$ref' => '#/components/schemas/Requirement' }
            },
          },
          required: [
            :id, :memberName, :memberStatus, :memberExpiration, :requirements
          ]
        }
      ]
    },

    error: {
      type: :object,
      properties: {
        message: { type: :string },
        status: { type: :number, 'x-nullable': true },
        error: { type: :string, 'x-nullable': true },
      },
      required: [:message]
    },
    passwordError: {
      type: :object,
      properties: {
        errors: {
          type: :object,
          properties: {
            email: {
              type: :array,
              items: {
                type: :string
              }
            }
          },
          required: [:email]
        }
      },
      required: [:errors]
    },
    passwordResetError: {
      type: :object,
      properties: {
        errors: {
          type: :object,
          properties: {
            reset_password_token: {
              type: :array,
              items: {
                type: :string
              }
            }
          },
          required: [:reset_password_token]
        }
      },
      required: [:errors]
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
        resourceClass: { '$ref' => '#/components/schemas/InvoiceableResource' },
        resourceId: { type: :string },
        quantity: { type: :number },
        discountId: { type: :string, 'x-nullable': true },
        memberName: { type: :string },
        memberId: { type: :string },
        refunded: { type: :boolean },
        refundRequested: { type: :string, 'x-nullable': true },
        resource: {
          type: :object,
          oneOf: [
            { '$ref' => '#/components/schemas/Member' },
            { '$ref' => '#/components/schemas/Rental' }
          ]
        }
      },
      required: [
        :id,
        :name,
        :description,
        :settled,
        :pastDue,
        :createdAt,
        :dueDate,
        :amount,
        :resourceClass,
        :resourceId,
        :quantity,
        :memberName,
        :memberId,
        :refunded,
        :resource
      ]
    },

    NewInvoiceOption:  {
      type: :object,
      properties: {
        name: { type: :string },
        amount: { type: :string },
        resourceClass: { '$ref' => '#/components/schemas/InvoiceableResource' },
        quantity: { type: :number },
        description: { type: :string, 'x-nullable': true },
        planId: { type: :string, 'x-nullable': true },
        discountId: { type: :string, 'x-nullable': true },
        disabled: { type: :boolean, 'x-nullable': true },
        isPromotion: { type: :boolean, 'x-nullable': true },
      },
      required: [
        :name,
        :amount,
        :resourceClass,
        :quantity
      ]
    },

    InvoiceOption: {
      allOf: [
        { '$ref' => '#/components/schemas/NewInvoiceOption' },
        {
          type: :object,
          properties: {
            id: { type: :string },
          },
          required: [
            :id,
          ]
        }
      ]
    },

    BaseMember: {
      type: :object,
      properties: {
        firstname: { type: :string },
        lastname: { type: :string },
        email: { type: :string },
        status: { '$ref': '#/components/schemas/MemberStatus' },
        role: { '$ref': '#/components/schemas/MemberRole' },
        expirationTime: { type: :number, 'x-nullable': true },
        memberContractOnFile: { type: :boolean },
        silenceEmails: { type: :boolean, 'x-nullable': true },
        notes: { type: :string, 'x-nullable': true },
      },
      required: [
        :firstname, 
        :lastname, 
        :email, 
      ]
    },
    NewMember: {
      allOf: [
        { '$ref' => '#/components/schemas/BaseMember' },
        {
          type: :object,
          properties: {
            phone: { type: :string, 'x-nullable': true },
            address: {
              type: :object,
              'x-nullable': true,
              properties: {
                street: { type: :string, 'x-nullable': true },
                unit: { type: :string,  'x-nullable': true },
                city: { type: :string, 'x-nullable': true },
                state: { type: :string, 'x-nullable': true },
                postalCode: { type: :string, 'x-nullable': true },
              }
            }
          },
        }
      ]
    },
    Member: {
      allOf: [
        { '$ref' => '#/components/schemas/NewMember' },
        {
          type: :object,
          properties: {
            id: { type: :string },
            cardId: { type: :string, 'x-nullable': true },
            subscriptionId: { type: :string, 'x-nullable': true },
            subscription: { type: :boolean },
            customerId: { type: :string, 'x-nullable': true },
            earnedMembershipId: { type: :string, 'x-nullable': true },
          },
          required: [:id, :expirationTime]
        }
      ]
    },
    AdminUpdateMemberDetails: {
      # TODO: This should use oneOf for renew/member partial
      type: :object,
      properties: {
        renew: { type: :number, 'x-nullable': true },
        subscription: { type: :boolean, 'x-nullable': true },
        firstname: { type: :string },
        lastname: { type: :string },
        email: { type: :string },
        status: { '$ref': '#/components/schemas/MemberStatus' },
        role: { '$ref': '#/components/schemas/MemberRole' },
        expirationTime: { type: :number },
        memberContractOnFile: { type: :boolean },
        notes: { type: :string },
        silenceEmails: { type: :boolean },
        phone: { type: :string },
        address: {
          type: :object,
          properties: {
            street: { type: :string },
            unit: { type: :string },
            city: { type: :string },
            state: { type: :string },
            postalCode: { type: :string },
          }
        },
      }
    },
    MemberSummary: {
      allOf: [
        { '$ref' => '#/components/schemas/BaseMember' },
        {
          type: :object,
          properties: {
            id: { type: :string },
          },
          required: [
            :id
          ]
        }
      ]
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
          items: { '$ref' => '#/components/schemas/Subscription' }
        },
        email: { type: :string },
      },
      required: [
        :id,
        :default,
        :customerId,
        :imageUrl,
        :subscriptions,
        :email
      ]
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
            },
            required: [:id, :name, :description, :amount]
          }
        }
      },
      required: [
        :id,
        :name,
        :type,
        :description,
        :amount,
        :billingFrequency,
        :discounts
      ]
    },

    NewRequirement: {
      type: :object,
      properties: {
        name: { type: :string },
        rolloverLimit: { type: :number },
        termLength: { type: :number },
        targetCount: { type: :number },
        strict: { type: :boolean },
      },
      required: [
        :name,
        :rolloverLimit,
        :termLength,
        :targetCount,
        :strict
      ]
    },
    Requirement: {
      allOf: [
        { '$ref' => '#/components/schemas/NewRequirement' },
        {
          type: :object,
          properties: {
            id: { type: :string },
            earnedMembershipId: { type: :string },
            currentCount: { type: :number },
            termStartDate: { type: :string },
            termEndDate: { type: :string },
            termId: { type: :string },
            satisfied: { type: :boolean }
          },
          required: [
            :id,
            :earnedMembershipId,
            :currentCount,
            :termStartDate,
            :termEndDate,
            :termId,
            :satisfied
          ]
        }
      ]
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
      },
      required: [
        :requirementId,
        :reportedCount,
        :memberIds
      ]
    },

    ReportRequirement: {
      allOf: [
        { '$ref' => '#/components/schemas/NewReportRequirement' },
        {
          type: :object,
          properties: {
            id: { type: :string },
            appliedCount: { type: :number },
            currentCount: { type: :number },
            termStartDate: { type: :string },
            termEndDate: { type: :string },
            satisfied: { type: :boolean }
          },
          required: [
            :id,
            :appliedCount,
            :currentCount,
            :termStartDate,
            :termEndDate,
            :satisfied
          ]
        }
      ]
    },

    NewReport: {
      type: :object,
      properties: {
        earnedMembershipId: { type: :string },
        reportRequirements: {
          type: :array,
          items: { '$ref' => '#/components/schemas/NewReportRequirement' }
        }
      },
      required: [:earnedMembershipId, :reportRequirements]
    },
    Report: {
      allOf: [
        { '$ref' => '#/components/schemas/NewReport' },
        {
          type: :object,
          properties: {
            id: { type: :string },
            date: { type: :string },
            reportRequirements: {
              type: :array,
              items: { '$ref' => '#/components/schemas/ReportRequirement' }
            }
          },
          required: [:id, :date, :earnedMembershipId, :reportRequirements]
        }
      ]
    },

    NewRental: {
      type: :object,
      properties: {
        number: { type: :string },
        memberId: { type: :string },
        description: { type: :string, 'x-nullable': true },
        expiration: { type: :number, 'x-nullable': true  },
        contractOnFile: { type: :boolean },
        notes: { type: :string, 'x-nullable': true },
      },
      required: [:number, :memberId]
    },

    Rental: {
      allOf: [
        { '$ref' => '#/components/schemas/NewRental' },
        {
          type: :object,
          properties: {
            id: { type: :string },
            memberName: { type: :string },
            subscriptionId: { type: :string, 'x-nullable': true },
          },
          required: [:id, :memberName]
        }
      ]
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
      },
      required: [
        :id,
        :planId,
        :status,
        :amount,
        :failureCount,
        :daysPastDue,
        :billingDayOfMonth,
        :firstBillingDate,
        :nextBillingDate,
        :memberId,
        :memberName,
        :resourceClass,
        :resourceId,
        :paymentMethodToken
      ]
    },


    Transaction: {
      type: :object,
      properties: {
        createdAt: { type: :string },
        customerDetails: { type: :object },
        disputes: { type: :array, items: { '$ref' => '#/components/schemas/Dispute' } },
        discountAmount: { type: :string },
        discounts: { type: :array, items: { '$ref' => '#/components/schemas/Discount' } },
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
        invoice: { '$ref' => '#/components/schemas/Invoice', 'x-nullable': true },
        paymentMethodDetails: {
          anyOf: [
            { '$ref' => '#/components/schemas/CreditCardSummary' },
            { '$ref' => '#/components/schemas/PayPalAccountSummary' }
          ]
        }
      },
      required: [
        :createdAt,
        :customerDetails,
        :disputes,
        :discountAmount,
        :discounts,
        :status,
        :id,
        :recurring,
        :refundIds,
        :amount,
        :memberName,
        :memberId,
        :paymentMethodDetails
      ]
    },
  }


  config.swagger_docs = {
    'v1/swagger.json' => {
      openapi: '3.0.3',
      info: {
        title: 'Makerspace Server V2',
        version: 'v2',
      },
      basePath: '/api',
      consumes: ['application/json'],
      produces: ['application/json', 'text/html'],
      components: {
        schemas: {
          MemberStatus: {
            type: :string,
            enum: ["activeMember", "inactive", "nonMember", "revoked"]
          },
          MemberRole: {
            type: :string,
            enum: ["admin", "member"],
          },
          PayPalAccountSummary: {
            type: :object,
            properties: {
              imageUrl: { type: :string },
              payerEmail: { type: :string },
              payerFirstName: { type: :string },
              payerLastName: { type: :string },
              token: { type: :string },
            }
          },
          CreditCardSummary: {
            type: :object,
            properties: {
              imageUrl: { type: :string },
              cardType: { type: :string },
              expirationMonth: { type: :number  },
              expirationYear: { type: :number  },
              expirationDate: { type: :string },
              last4: { type: :number  },
              debit: { type: :boolean },
              token: { type: :string },
            }
          },
          InvoiceableResource: {
            type: :string, enum: ["member", "rental"]
          }
        }.merge(definitions)
      }
    }
  }
end
