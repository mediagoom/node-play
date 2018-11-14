FROM node:10-alpine

ENV NODEPLAYDEFOWNER=docker
ENV NODE_ENV=production
ENV NODEPLAYDESTINATION=/node-play/media

WORKDIR /node-play
COPY . .
RUN npm install && mkdir media

EXPOSE 3000

CMD node ./bin/server/index.js
