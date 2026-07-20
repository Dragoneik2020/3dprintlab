FROM node:18-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY server/package*.json ./server/
RUN cd server && npm install --production

COPY . .

EXPOSE 3001

ENV PORT=3001

CMD ["node", "server/index.js"]
