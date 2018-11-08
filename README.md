# node-play

[![Build Status](https://travis-ci.org/mediagoom/node-play.svg?branch=master)](https://travis-ci.org/mediagoom/node-play)

A nodejs web streaming server. It needs node 8 or above.

![node-play streaming server](http://mediagoom.com/assets/bigbunny.gif)

*node-play* is a web server witch expose api for encoding your videos and playing them back in either HLS (HTTP LIVE STREAMING) or MPEG-DASH.

The UI is implemented in vue.js and the sources are in the [mediagoom/node-play-ui](https://github.com/mediagoom/node-play-ui) repository.

For encoding it uses [*ffmpeg*](https://ffmpeg.org/download.html). A free tool.

For packaging it uses [*mg*](https://github.com/mediagoom/mg). A free tool.

It should work on both *Linux* and *Window*.

If you want to run on other platforms you may need to build the above tools yourself.

To install it run:
```bash
npm install -g @mediagoom/node-play
```
To run it run:
```bash
nodeplay
```
or if you install it locally
```bash
node ./node_modules/.bin/nodeplay
```

- navigate to http://localhost:3000

### Contribution are very welcome








