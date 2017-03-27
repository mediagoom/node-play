# node-webplay

A nodejs streaming server implementation.

![node-webplay streaming server](http://mediagoom.com/assets/bigbunny.gif)

*node-webplay* is a web server witch expose api for encondig your videos and plaing them back in either HLS (HTTP LIVE STREAMING) or MPEG-DASH.

Its UI is impemented in vue.js and the source are in the [mediagoom/node-play-ui](https://github.com/mediagoom/node-play-ui) repository.

For encoding it uses [*ffmpeg*](https://ffmpeg.org/download.html). A free tool.

For packaging it uses [*mg*](https://github.com/mediagoom/mg).

It should work in *Linux* and *Window*.

In order to use it you can follow these steps:

- Clone the repository
- Download and put in your path [*ffmpeg*](https://ffmpeg.org/download.html).
- Download and put in your path [*mg*](http://mediagoom.com/download)
- Run: 
```bash
mg --help
ffmpeg --help
npm run build
node ./bin/server/index.js
```
- navigate to http://localhost:3000

## Roadmap

At this point the functionality are limited. When we have time and resources we would like to add additional functionality.
At this point this is our list:

- npm install
- live streaming
- DRM support
- dynamic packaging

We would love to have our feedback on these features. How impotant they are for you? 


