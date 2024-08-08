###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20-alpine As development

# Create app directory
WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

ARG SENTRY_AUTH_TOKEN=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

ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:20-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node keys ./keys

CMD [ "node", "--max_old_space_size=250", "--gc_interval=100", "--optimize-for-size", "dist/main.js" ]
