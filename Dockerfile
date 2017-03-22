FROM node:6.10.0

ARG URL=https://github.com/mediagoom/mg/releases/download/v0.1.3/mg 
ARG BRANCH=dev

#RUN apt-get update \
#    && apt-get install --no-install-recommends --no-install-suggests -y \
#                                                                      git  \
RUN curl -L ${URL} -O \ 
    && chmod +x mg  \
    && mv ./mg /usr/local/bin/mg \
    && curl https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz -O \
    && tar -Jxvf ffmpeg-release-64bit-static.tar.xz \
    && mv ./ffmpeg-3.2.4-64bit-static/ffmpeg /usr/local/bin/ffmpeg \
    && git clone https://github.com/mediagoom/node-play.git \
    && cd node-play \
    && git checkout ${BRANCH} \
    && npm install \
    && npm run build \
    && npm start \
    && npm test \
    && npm stop


CMD node ./bin/server/index.js
