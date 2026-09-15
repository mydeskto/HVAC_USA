# syntax=docker/dockerfile:1

FROM node:22-alpine AS api-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

FROM node:22-alpine AS api-deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS web-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM caddy:2-alpine
RUN apk add --no-cache nodejs

COPY --from=api-deps /app/node_modules /app/api/node_modules
COPY --from=api-build /app/dist /app/api/dist
COPY backend/package.json /app/api/package.json
COPY backend/drizzle /app/api/drizzle
RUN mkdir -p /app/api/uploads

COPY --from=web-build /app/out /srv
COPY frontend/Caddyfile /etc/caddy/Caddyfile
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80 443
CMD ["/start.sh"]
