# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk update && apk upgrade --no-cache

COPY package*.json ./

RUN npm install -g npm@latest && npm ci

COPY . .

ARG VITE_BACKEND_URL=""
RUN npm run build


# Stage 2: Production Nginx
FROM nginx:alpine

RUN apk update && apk upgrade --no-cache

ARG NGINX_CONFIG=nginx.conf
COPY ${NGINX_CONFIG} /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]