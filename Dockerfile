FROM node:10-alpine

ARG NODEPLAYDEFOWNER=docker
ENV NODEPLAYDEFOWNER="${NODEPLAYDEFOWNER}"
ENV NODE_ENV=production
ARG NODEPLAYDESTINATION=/node-play/media
ENV NODEPLAYDESTINATION="${NODEPLAYDESTINATION}"


WORKDIR /node-play
COPY . .
RUN npm install && mkdir media \
    && node ./downloadtools.js \
    && npm i \
    && ls /node-play/node_modules/@mediagoom

EXPOSE 3000

CMD node ./src/server/index.js
