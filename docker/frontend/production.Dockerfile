FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable

# Copy package manifests and Yarn config first for layer caching
COPY frontend/package.json frontend/yarn.lock frontend/.yarnrc.yml ./
COPY frontend/.yarn ./.yarn

RUN yarn install

COPY frontend/ ./

ARG REACT_APP_BACKEND_ADDRESS
ARG PUBLIC_URL=/app
ENV REACT_APP_BACKEND_ADDRESS=${REACT_APP_BACKEND_ADDRESS}
ENV PUBLIC_URL=${PUBLIC_URL}

RUN yarn build

# Production stage - serve static files with nginx
FROM nginx:alpine

# Copy built React app
COPY --from=builder /app/build /usr/share/nginx/html/app

# Custom nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    location /app { \
        alias /usr/share/nginx/html/app; \
        try_files $uri $uri/ /app/index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
