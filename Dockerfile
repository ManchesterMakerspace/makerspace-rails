# Build UI

FROM node:16.20 AS ui

WORKDIR /app

COPY ui/package.json ui/yarn.lock ./

RUN yarn install

COPY ui/ .

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

COPY --from=ui /app/dist/makerspace-react.js ./app/assets/javascript/
COPY --from=ui /app/dist/makerspace-react.css ./app/assets/stylesheets/

# RUN bundle exec rails assets:precompile

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
