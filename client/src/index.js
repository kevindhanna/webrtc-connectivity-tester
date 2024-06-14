"use strict";

global.window = { location: { pathname: "" }, nodeVersion: process.version, screen: { width: 0 } };
global.navigator = { userAgent: "Node.js/20" };
class DOMException {
    constructor(...args) {
        console.error("DOMException", args);
    }
}
global.DOMException = DOMException;

const ws = require("ws");
global.WebSocket = ws;

const werift = require("werift");
global.GenericNack = werift.GenericNack;
global.GroupDescription = werift.GroupDescription;
global.IceCandidate = werift.IceCandidate;
global.MediaDescription = werift.MediaDescription;
global.MediaStream = werift.MediaStream;
global.MediaRecorder = werift.MediaRecorder;
global.MediaStreamTrack = werift.MediaStreamTrack;
global.PictureLossIndication = werift.PictureLossIndication;
global.PromiseQueue = werift.PromiseQueue;
global.RTCCertificate = werift.RTCCertificate;
global.RTCDataChannel = werift.RTCDataChannel;
global.RTCDataChannelParameters = werift.RTCDataChannelParameters;
global.RTCDtlsFingerprint = werift.RTCDtlsFingerprint;
global.RTCDtlsParameters = werift.RTCDtlsParameters;
global.RTCDtlsTransport = werift.RTCDtlsTransport;
global.RTCIceGatherer = werift.RTCIceGatherer;
global.RTCIceParameters = werift.RTCIceParameters;
global.RTCIceTransport = werift.RTCIceTransport;
global.RTCPeerConnection = werift.RTCPeerConnection;
global.RTCRtcpFeedback = werift.RTCRtcpFeedback;
global.RTCRtcpParameters = werift.RTCRtcpParameters;
global.RTCRtpCodecParameters = werift.RTCRtpCodecParameters;
global.RTCRtpCodingParameters = werift.RTCRtpCodingParameters;
global.RTCRtpHeaderExtensionParameters = werift.RTCRtpHeaderExtensionParameters;
global.RTCRtpRtxParameters = werift.RTCRtpRtxParameters;
global.RTCRtpSimulcastParameters = werift.RTCRtpSimulcastParameters;
global.RTCRtpTransceiver = werift.RTCRtpTransceiver;
global.RTCSctpCapabilities = werift.RTCSctpCapabilities;
global.RTCSctpTransport = werift.RTCSctpTransport;
global.RTCSessionDescription = werift.RTCSessionDescription;
global.ReceiverEstimatedMaxBitrate = werift.ReceiverEstimatedMaxBitrate;
global.RecvDelta = werift.RecvDelta;
global.RtcpHeader = werift.RtcpHeader;
global.RtcpPacketConverter = werift.RtcpPacketConverter;
global.RtcpPayloadSpecificFeedback = werift.RtcpPayloadSpecificFeedback;
global.RtcpReceiverInfo = werift.RtcpReceiverInfo;
global.RtcpRrPacket = werift.RtcpRrPacket;
global.RtcpSenderInfo = werift.RtcpSenderInfo;
global.RtcpSourceDescriptionPacket = werift.RtcpSourceDescriptionPacket;
global.RtcpSrPacket = werift.RtcpSrPacket;
global.RtcpTransportLayerFeedback = werift.RtcpTransportLayerFeedback;
global.RtpBuilder = werift.RtpBuilder;
global.RtpHeader = werift.RtpHeader;
global.RtpPacket = werift.RtpPacket;
global.RunLengthChunk = werift.RunLengthChunk;
global.SessionDescription = werift.SessionDescription;
global.SourceDescriptionChunk = werift.SourceDescriptionChunk;
global.SourceDescriptionItem = werift.SourceDescriptionItem;
global.SrtcpSession = werift.SrtcpSession;
global.SrtpSession = werift.SrtpSession;
global.SsrcDescription = werift.SsrcDescription;
global.StatusVectorChunk = werift.StatusVectorChunk;
global.TransportWideCC = werift.TransportWideCC;

// Add missing properties to the RTCPeerConnection prototype
if (!global.RTCPeerConnection.prototype.getConfiguration) {
    Object.assign(global.RTCPeerConnection.prototype, {
        getConfiguration() {
            console.warn(
                "getConfiguration is not implemented, using our own fallback function to return the config object."
            );
            return this.config;
        },
    });
}
if (!global.RTCPeerConnection.prototype.setConfiguration) {
    Object.assign(global.RTCPeerConnection.prototype, {
        setConfiguration(config) {
            console.warn(
                "setConfiguration is not implemented, using our own fallback function to set the config object."
            );
            this.config = {
                ...this.config,
                iceServers: config.iceServers,
            };
        },
    });
}

process.on("SIGTERM", () => {
    process.exit(0);
});
setTimeout(() => {
    console.log("Timed out");
    process.exit(0);
}, 60 * 1000);

require("./run");
