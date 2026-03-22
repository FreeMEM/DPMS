FROM node:20-alpine

WORKDIR /app/frontend

# Enable Corepack for Yarn 4
RUN corepack enable

# Copy package manifests and Yarn config first for layer caching
COPY frontend/package.json frontend/yarn.lock frontend/.yarnrc.yml ./
COPY frontend/.yarn ./.yarn

RUN yarn install

COPY frontend/ ./

EXPOSE 3000

CMD ["yarn", "start"]
