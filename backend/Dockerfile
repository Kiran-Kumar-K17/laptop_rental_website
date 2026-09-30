FROM node:22-alpine

# Update global npm to patch built-in vulnerabilities
RUN npm install -g npm@latest

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

# Copy only necessary folders/files
COPY config/ ./config/
COPY controllers/ ./controllers/
COPY middleware/ ./middleware/
COPY models/ ./models/
COPY routes/ ./routes/
COPY utils/ ./utils/
COPY validators/ ./validators/
COPY server.js ./

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]