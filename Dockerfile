ARG ENVIRONMENT="production"

FROM ruby:2.6.9-bullseye

WORKDIR /app

EXPOSE 3000

ENV RAILS_ENV=$ENVIRONMENT

COPY Gemfile Gemfile.lock ./

RUN bundle install

COPY . .

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
