"use strict";

let ignoreOffer = false;
let makingOffer = false;
let polite;
const outboundCandidateQueue = [];

class Signaler extends WebSocket {
    dispatch(type, payload) {
        this.send(JSON.stringify({ type, payload }));
    }
}
const signaler = new Signaler("wss://e5b7-31-94-16-253.ngrok-free.app");

const handleCandidate = async (pc, candidate, ignoreOffer) => {
    try {
        console.log("adding candidate", candidate);
        await pc.addIceCandidate(candidate);
    } catch (err) {
        if (!ignoreOffer) {
            throw err;
        }
    }
};

const handleDescription = async (pc, description) => {
    const offerCollision = description.type === "offer" && (makingOffer || (pc && pc.signalingState !== "stable"));

    ignoreOffer = !polite && offerCollision;
    if (ignoreOffer) {
        console.log("ignoring offer");
        return;
    }

    console.log("setting remote description", description);
    await pc.setRemoteDescription(description);

    if (description.type === "offer") {
        const answer = await pc.createAnswer();
        console.log("handleDescription: setting local description", answer);
        await pc.setLocalDescription(answer);
        signaler.dispatch("description", pc.localDescription);
    }
};

const handleCommand = async (pc, command) => {
    switch (command) {
        case "start": {
            console.log("Starting datachannel");
            const channel = pc.createDataChannel("foobar");
            channel.onmessage = async (event) => {
                if (event.data === "Hello!") {
                    console.log("Datachannel Success!");
                }
                // const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

                // console.log("Got media stream", mediaStream);
                // const audioTracks = mediaStream.getAudioTracks();
                // audioTracks.forEach((track) => pc.addTrack(track, mediaStream));
            };
        }
    }
};

const handleTrackEvent = ({ receiver, streams, track, transceiver }) => {
    // let packetCount = 0;
    // track.onReceiveRtp.subscribe((rtp) => {
    //     if (packetCount % 100 === 0) {
    //         console.log("Packets receieved", packetCount);
    //     }
    //     packetCount = packetCount + 1;
    //     if (packetCount > 500) {
    //         console.log("Success!");
    //         process.exit(0);
    //     }
    // });
};

const startPc = async (config) => {
    polite = config.polite;
    const pc = new RTCPeerConnection(config);

    pc.onnegotiationneeded = async () => {
        try {
            makingOffer = true;
            const offer = await pc.createOffer();
            console.log("negotiationNeeded: setting local description", offer);
            await pc.setLocalDescription(offer);
            signaler.dispatch("description", pc.localDescription);
            while (outboundCandidateQueue.length > 0) {
                const candidate = outboundCandidateQueue.pop();
                signaler.dispatch("candidate", candidate);
            }
        } catch (err) {
            console.error(err);
        } finally {
            makingOffer = false;
        }
    };

    pc.onicecandidate = ({ candidate }) => {
        if (pc.currentLocalDescription) {
            signaler.dispatch("candidate", candidate);
        } else {
            outboundCandidateQueue.push(candidate);
        }
    };
    pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "failed") {
            console.log("ICE failed");
        }
    };
    pc.ondatachannel = ({ channel }) => {
        channel.send("Hello!");
        console.log("Datachannel message sent");
    };
    pc.ontrack = handleTrackEvent;
    pc.onconnectionstatechange = (ev) => {
        if (pc.connectionState === "failed") {
            pc.restartIce?.();
        }
    };

    return pc;
};

let pc;

signaler.onmessage = async (message) => {
    const { type, payload } = JSON.parse(message.data.toString());

    try {
        switch (type) {
            case "config": {
                pc = await startPc(payload);
                signaler.dispatch("ready");
                break;
            }
            case "command": {
                handleCommand(pc, payload);
                break;
            }
            case "description": {
                await handleDescription(pc, payload);
                break;
            }
            case "candidate": {
                await handleCandidate(pc, payload);
                break;
            }
        }
    } catch (err) {
        console.error(err);
    }
};
