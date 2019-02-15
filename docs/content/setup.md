---
layout: default
title: Setup
order: 1
---


# npm

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
npm init
```

then install it locally
```bash
npm install @mediagoom/node-play
```

run it
```bash
./node_modules/.bin/nodeplay
```

## Connect

Open your browser to [http://localhost:3000](http://localhost:3000)

# Docker

You can use Docker to run node-play. The docker image is [here](https://hub.docker.com/r/mediagoom/node-play).

```bash
docker run -d -p 80:3000 --name node-play mediagoom/node-play 
```

## Connect

Open your browser to [http://localhost or http://localhost:port](http://localhost) in case you are using an other port.







