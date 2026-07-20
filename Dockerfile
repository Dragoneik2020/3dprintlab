FROM node:18

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --production

COPY . .

EXPOSE 3001

ENV PORT=3001

CMD ["node", "server/index.js"]
