# Build UI

FROM node:16.20 AS ui

WORKDIR /app

COPY ui/package.json ui/yarn.lock ./ui/

WORKDIR /app/ui
RUN yarn install
WORKDIR /app

COPY . .

WORKDIR /app/ui
RUN yarn build

# Build backend

FROM ruby:2.6.9-bullseye

WORKDIR /app

EXPOSE 3000

COPY Gemfile Gemfile.lock ./

RUN bundle install

ARG ENVIRONMENT="production"
ENV RAILS_ENV=$ENVIRONMENT

COPY . .

COPY --from=ui /app/app/assets/builds/* /app/app/assets/builds/

# RUN bundle exec rails assets:precompile

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
