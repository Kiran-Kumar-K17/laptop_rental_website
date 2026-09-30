FROM node:22-alpine

WORKDIR /app

RUN apk upgrade --no-cache \
    && npm install --global npm@latest \
    && npm cache clean --force

COPY package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]