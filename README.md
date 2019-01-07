# node-play

[![Build Status](https://travis-ci.org/mediagoom/node-play.svg?branch=master)](https://travis-ci.org/mediagoom/node-play) [![Coverage Status](https://coveralls.io/repos/github/mediagoom/node-play/badge.svg?branch=master)](https://coveralls.io/github/mediagoom/node-play?branch=master) [![codecov](https://codecov.io/gh/mediagoom/node-play/branch/master/graph/badge.svg)](https://codecov.io/gh/mediagoom/node-play)



A nodejs web streaming server. It needs node 8 or above.



*node-play* is a web server witch expose api for encoding your videos and playing them back in either HLS (HTTP LIVE STREAMING) or MPEG-DASH.

The UI is implemented in vue.js and the sources are in the [mediagoom/node-play-ui](https://github.com/mediagoom/node-play-ui) repository.

For encoding it uses [*ffmpeg*](https://ffmpeg.org/download.html). A free tool.

For packaging it uses [*mg*](https://github.com/mediagoom/mg). A free tool.

It should work on both *Linux* and *Window*.

If you want to run on other platforms you may need to install the above tools yourself.

## Run with docker
```bash
docker run -d -p 80:3000 --name node-play mediagoom/node-play 
```

## Install globally

To install it globally run:
```bash
sudo -E npm install -g @mediagoom/node-play
```

To run it type:
```bash
nodeplay
```

## Install locally

Create a directory to host node-play
```bash
mkdir nodeplay
cd nodeplay
```

then install it locally
```bash
npm install @mediagoom/node-play
```

run it
```bash
./node_modules/.bin/nodeplay
```

- navigate to http://localhost:3000

## Configure 

If you set the environment variable NODE_ENV to production *node-play* will save its works flows to disk. In this way in case something should happen in an encoding it will be restarted when *node-play* is restarted.








