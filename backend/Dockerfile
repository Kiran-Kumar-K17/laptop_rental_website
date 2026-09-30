FROM node:22-alpine

WORKDIR /app

RUN apk upgrade --no-cache \
    && npm install --global npm@latest \
    && npm cache clean --force

COPY package*.json ./

<<<<<<< HEAD
RUN npm ci --omit=dev && npm cache clean --force
=======
RUN npm ci --omit=dev \
    && npm cache clean --force
>>>>>>> 50af983 (Update Node.js version in CI workflow and enhance Dockerfile for better package management)

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]