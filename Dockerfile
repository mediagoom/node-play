FROM node:10-alpine

ARG NODEPLAYDEFOWNER=docker
ENV NODEPLAYDEFOWNER="${NODEPLAYDEFOWNER}"
ENV NODE_ENV=production
ARG NODEPLAYDESTINATION=/node-play/media
ENV NODEPLAYDESTINATION="${NODEPLAYDESTINATION}"


WORKDIR /node-play
COPY . .
RUN npm install --allow-root install && mkdir media \
    && node ./downloadtools.js

EXPOSE 3000

CMD node ./src/server/index.js
