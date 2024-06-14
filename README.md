# WebRTC Connectivity Test Tool
Simple client and signaller to see if ICE gathering and datachannel connectivity works correctly for two WebRTC clients in various combinations of node and browser

## To Run

### Signaller
Super simple relay, just stand it up somewhere with `node signaler/index.js` and make note of the address

### Client

Uses [Werift](https://github.com/shinyoshiaki/werift-webrtc) when run in Node with `node client/src/index.js`, otherwise just open the index.html in a browser and you're good to go 

Also comes with a Dockerfile for running in docker! :tada:
