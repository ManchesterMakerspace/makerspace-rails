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
      }, required: true

      response '201', 'User signed in' do 
        schema '$ref' => '#/definitions/Member'
        let(:signInDetails) {{ member: { email: auth_member.email, password: "password" } }}
        run_test!
      end

      response '401', 'User unauthenticated' do 
        schema '$ref' => '#/definitions/error'
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
        schema '$ref' => '#/definitions/Member'
        let(:passwordResetDetails) {{ member: { email: auth_member.email } }}
        run_test!
      end

      response '422', 'Email not found' do 
        schema '$ref' => '#/definitions/error'
        let(:passwordResetDetails) {{ member: { email: "basdfkjlalsdfja@foo.com" } }}
        run_test!
      end
    end 

    put 'Updates member password' do 
      tags 'Password'
      operationId 'resetPassword'
      parameter name: :passwordResetDetails, in: :body, schema: {
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
        schema '$ref' => '#/definitions/error'
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
              },
              firstname: {
                type: :string
              },
              lastname: {
                type: :string
              }
            }
          }
        }
      }, required: true

      response '200', 'Member registered' do 
        schema '$ref' => '#/definitions/Member'
        let(:registerMemberDetails) {{ member: { firstname: "First", lastname: "Last", email: "first@last.com", password: "password" } }}
        run_test!
      end

      response '422', 'Email already exists' do 
        before { create(:member, email: "foo@foo.com")}
        schema '$ref' => '#/definitions/error'
        let(:registerMemberDetails) {{ member: { firstname: "First", lastname: "Last", email: "foo@foo.com", password: "password" } }}
        run_test!
      end
    end
  end
end
