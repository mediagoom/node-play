# node-webplay

A nodejs streaming server implementation.

![node-webplay streaming server](http://mediagoom.com/assets/bigbunny.gif)

*node-webplay* is a web server witch expose api for encondig your videos and plaing them back in either HLS (HTTP LIVE STREAMING) or MPEG-DASH.

The UI is impemented in vue.js and the source are in the [mediagoom/node-play-ui](https://github.com/mediagoom/node-play-ui) repository.

For encoding it uses [*ffmpeg*](https://ffmpeg.org/download.html). A free tool.

For packaging it uses [*mg*](https://github.com/mediagoom/mg). A free tool.

It should work on *Linux* and *Window*.

To install it run:
```bash
npm install node-webplay
```
To run it run:
```bash
./node_modules/.bin/webplay
```
or
```bash
node ./node_modules/node-webplay/bin/server.js
```

- navigate to http://localhost:3000

In order to build it you can follow these steps:

- Clone the repository
    - ``` git clone git://github.com/mediagoom/node-play ```
- Download Tools [*ffmpeg*](https://ffmpeg.org/download.html) and [*mg*](http://mediagoom.com/download)
    - ``` node downloadtools.js ```
- Run: 
```bash
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

We would love to have your feedback on these features. How impotant they are for you? 


