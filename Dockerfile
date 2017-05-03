FROM node:6.10.1-alpine

#ARG URL=https://github.com/mediagoom/mg/releases/download/v0.1.3/mg 
ARG URL=https://www.dropbox.com/s/pasw0hnlgegshem/mg?dl=0
ARG BRANCH=dev

ENV NODEPLAYDEFOWNER=docker

#RUN apt-get update \
#    && apt-get install --no-install-recommends --no-install-suggests -y \
#                                                                      git  \
RUN apk add --no-cache \
       curl \
       unzip \
    && curl -L ${URL} -O \ 
    && chmod +x mg?dl=0  \
    && mv ./mg?dl=0 /usr/local/bin/mg \
    && curl https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz -O \
    && tar -Jxvf ffmpeg-release-64bit-static.tar.xz \
    && mv ./ffmpeg-3.2.4-64bit-static/ffmpeg /usr/local/bin/ffmpeg \
    && curl https://github.com/mediagoom/node-play/archive/${BRANCH}.zip -O -L \
    && unzip ${BRANCH}.zip \
    && ls \
    && cd node-play-${BRANCH} \
    && npm install \
    && npm run build \
    && npm start \
    && npm test \
    && npm stop \
    && rm src -fr \
    && rm uploader -fr \
    && rm statman -fr \
    && cd .. \
    && rm ffmpeg-release-64bit-static.tar.xz \
    && rm ffmpeg-3.2.4-64bit-static -fr \
    && rm ${BRANCH}.zip


WORKDIR /node-play-${BRANCH}

EXPOSE 3000

CMD node ./bin/server/index.js
