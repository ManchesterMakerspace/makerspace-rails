# export const Auth = {
#   SignIn: `${Members}/sign_in`,
#   SignOut: `${Members}/sign_out`,
#   Password: `${Members}/password`,
#   SignUp: `${Members}`,
#   SendRegistration: `${baseApiPath}/send_registration`
# }

require 'swagger_helper'

describe 'Registrations API', type: :request do
  let(:auth_member) { create(:member) }
  path '/members/sign_in' do
    post 'Signs in user' do
      tags 'Authentication'
      operationId 'signIn'
      parameter name: :signInDetails, in: :body, schema: {
        title: :signInDetails,
        type: :object,
        properties: {
          member: {
            type: :object,
            properties: {
              email: {
                type: :string
              },
              password: {
                type: :string
              }
            }
          }
        }
      }

      request_body_json schema: {
        title: :signInDetails,
        type: :object,
        properties: {
          member: {
            type: :object,
            properties: {
              email: {
                type: :string
              },
              password: {
                type: :string
              }
            }
          }
        }
      }

      response '200', 'User signed in' do
        schema '$ref' => '#/components/schemas/Member'

          let(:signInDetails) {{ member: { email: auth_member.email, password: "password" } }}
        run_test!
      end

      response '401', 'User unauthenticated' do
        schema '$ref' => '#/components/schemas/error'
        let(:signInDetails) {{ member: { email: auth_member.email, password: "wrong password" } }}
        run_test!
      end
    end
  end

  path '/members/sign_out' do
    delete 'Signs out user' do
      tags 'Authentication'
      operationId 'signOut'

      response '204', 'User signed out' do
        before { sign_in create(:member) }
        run_test!
      end
    end
  end

  path '/members/password' do
    post 'Sends password reset instructions' do
      tags 'Password'
      operationId 'requestPasswordReset'
      parameter name: :passwordResetDetails, in: :body, schema: {
        title: :passwordResetDetails, 
        type: :object,
        properties: {
          member: {
            type: :object,
            properties: {
              email: {
                type: :string
              },
            }
          }
        }
      }, required: true

      request_body_json schema: {
        title: :passwordResetDetails, 
        type: :object,
        properties: {
          member: {
            type: :object,
            properties: {
              email: {
                type: :string
              },
            }
          }
        }
      }, required: true

      response '201', 'Instructions sent' do
        before { auth_member }
        let(:passwordResetDetails) {{ member: { email: auth_member.email } }}
        run_test!
      end

      response '422', 'Email not found' do
        schema '$ref' => '#/components/schemas/passwordError'
        let(:passwordResetDetails) {{ member: { email: "basdfkjlalsdfja@foo.com" } }}
        run_test!
      end
    end

    put 'Updates member password' do
      tags 'Password'
      operationId 'resetPassword'
      parameter name: :passwordResetDetails, in: :body, schema: {
        title: :passwordResetDetails, 
        type: :object,
        properties: {
          member: {
            type: :object,
            properties: {
              resetPasswordToken: {
                type: :string
              },
              password: {
                type: :string
              }
            }
          }
        }
      }, required: true

      request_body_json schema: {
        title: :passwordResetDetails, 
        type: :object,
        properties: {
          member: {
            type: :object,
            properties: {
              resetPasswordToken: {
                type: :string
              },
              password: {
                type: :string
              }
            }
          }
        }
      }, required: true

      response '204', 'Password reset' do
        raw_token, hashed_token = Devise.token_generator.generate(Member, :reset_password_token)
        before {
          auth_member
          auth_member.reset_password_token = hashed_token
          auth_member.reset_password_sent_at = Time.now.utc
          auth_member.save!
        }
        let(:passwordResetDetails) {{ member: { resetPasswordToken: raw_token, password: "password" } }}
        run_test!
      end

      response '422', 'Invalid token' do
        schema '$ref' => '#/components/schemas/passwordError'
        let(:passwordResetDetails) {{ member: { resetPasswordToken: "basdfkjlalsdfj", password: "password" } }}
        run_test!
      end
    end
  end

  path '/members' do
    post 'Registers new member' do
      tags 'Authentication'
      operationId 'registerMember'
      parameter name: :registerMemberDetails, in: :body, schema: {
        title: :registerMemberDetails,
        type: :object,
        properties: {
          email: {
            type: :string
          },
          password: {
            type: :string
          },
          firstname: {
            type: :string
          },
          lastname: {
            type: :string
          },
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
        },
        required: [:email, :password, :firstname, :lastname]
      }, required: true

      request_body_json schema: {
        title: :registerMemberDetails,
        type: :object,
        properties: {
          email: {
            type: :string
          },
          password: {
            type: :string
          },
          firstname: {
            type: :string
          },
          lastname: {
            type: :string
          },
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
        },
        required: [:email, :password, :firstname, :lastname]
      }, required: true

      response '200', 'Member registered' do

        schema '$ref' => '#/components/schemas/Member'

        let(:registerMemberDetails) {{ firstname: "First", lastname: "Last", email: "first@last.com", password: "password" }}
        run_test!
      end

      response '422', 'Email already exists' do
        before { create(:member, email: "foo@foo.com")}
        schema '$ref' => '#/components/schemas/error'
        let(:registerMemberDetails) {{ firstname: "First", lastname: "Last", email: "foo@foo.com", password: "password" }}
        run_test!
      end
    end
  end

  path '/send_registration' do
    post 'Sends registration email' do
      tags 'Authentication'
      operationId 'sendRegistrationEmail'
      parameter name: :registrationEmailDetails, in: :body, schema: {
        title: :registrationEmailDetails, 
        type: :object,
        properties: {
          email: {
            type: :string
          },
        },
        required: [:email]
      }, required: true

      request_body_json schema: {
        title: :registrationEmailDetails, 
        type: :object,
        properties: {
          email: {
            type: :string
          },
        },
        required: [:email]
      }, required: true

      response '204', 'Registration email sent' do
        let(:registrationEmailDetails) {{ email: "first@last.com" }}
        run_test!
      end

      response '409', 'Email already exists' do
        before { create(:member, email: "foo@foo.com")}
        schema '$ref' => '#/components/schemas/error'
        let(:registrationEmailDetails) {{ email: "foo@foo.com" }}
        run_test!
      end
    end
  end
end
