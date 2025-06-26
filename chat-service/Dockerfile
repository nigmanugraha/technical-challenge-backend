FROM node:18

WORKDIR /app

COPY ./chat-service/package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]
