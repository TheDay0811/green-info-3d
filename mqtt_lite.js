/**
 * Minimal zero-dependency MQTT 3.1.1 client over Browser WebSocket (WSS)
 * Connects Wokwi ESP32 (TCP:1883) <-> Green Info Web 3D & Phone App (WSS:8084/mqtt).
 */

function encodeVarLen(len) {
  const bytes = [];
  do {
    let d = len & 0x7f;
    len >>= 7;
    if (len > 0) d |= 0x80;
    bytes.push(d);
  } while (len > 0);
  return bytes;
}

function encodeUtf8String(str) {
  const utf8 = new TextEncoder().encode(str);
  return [(utf8.length >> 8) & 0xff, utf8.length & 0xff, ...utf8];
}

function buildConnectPacket(clientId, keepAliveSec = 30) {
  const varHdr = [
    0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, // "MQTT"
    0x04, // Protocol Level 4 (3.1.1)
    0x02, // Clean session
    (keepAliveSec >> 8) & 0xff,
    keepAliveSec & 0xff,
  ];
  const payload = encodeUtf8String(clientId);
  const remLen = encodeVarLen(varHdr.length + payload.length);
  return new Uint8Array([0x10, ...remLen, ...varHdr, ...payload]);
}

function buildSubscribePacket(packetId, topic) {
  const varHdr = [(packetId >> 8) & 0xff, packetId & 0xff];
  const payload = [...encodeUtf8String(topic), 0x00]; // QoS 0
  const remLen = encodeVarLen(varHdr.length + payload.length);
  return new Uint8Array([0x82, ...remLen, ...varHdr, ...payload]);
}

function buildPublishPacket(topic, messageStr) {
  const topicBytes = encodeUtf8String(topic);
  const msgBytes = new TextEncoder().encode(messageStr);
  const remLen = encodeVarLen(topicBytes.length + msgBytes.length);
  return new Uint8Array([0x30, ...remLen, ...topicBytes, ...msgBytes]);
}

export class MqttLiteClient {
  constructor({ url = "wss://broker.emqx.io:8084/mqtt", onStatus, onMessage } = {}) {
    this.url = url;
    this.onStatus = onStatus || (() => {});
    this.onMessage = onMessage || (() => {});
    this.ws = null;
    this.pingTimer = null;
    this.subTopics = [];
    this.packetId = 1;
    this.rxBuf = new Uint8Array(0);
    this.connected = false;
  }

  connect(clientId) {
    this.disconnect();
    this.onStatus("connecting");
    const ws = new WebSocket(this.url, ["mqtt"]);
    ws.binaryType = "arraybuffer";
    this.ws = ws;

    ws.onopen = () => {
      const id = clientId || `gi-web-${Math.random().toString(16).slice(2, 8)}`;
      ws.send(buildConnectPacket(id, 30));
    };

    ws.onmessage = (ev) => {
      const chunk = new Uint8Array(ev.data);
      const merged = new Uint8Array(this.rxBuf.length + chunk.length);
      merged.set(this.rxBuf, 0);
      merged.set(chunk, this.rxBuf.length);
      this.rxBuf = merged;
      this._parseBuffer();
    };

    ws.onerror = () => {
      this.onStatus("error");
    };

    ws.onclose = () => {
      this.connected = false;
      clearInterval(this.pingTimer);
      this.pingTimer = null;
      this.onStatus("disconnected");
    };
  }

  _parseBuffer() {
    while (this.rxBuf.length >= 2) {
      const header = this.rxBuf[0];
      let mul = 1;
      let remLen = 0;
      let idx = 1;
      let completeVarLen = false;
      while (idx < this.rxBuf.length) {
        const b = this.rxBuf[idx++];
        remLen += (b & 0x7f) * mul;
        if ((b & 0x80) === 0) {
          completeVarLen = true;
          break;
        }
        mul *= 128;
        if (idx > 5) break;
      }
      if (!completeVarLen || this.rxBuf.length < idx + remLen) break;

      const pkt = this.rxBuf.subarray(idx, idx + remLen);
      this.rxBuf = this.rxBuf.subarray(idx + remLen);
      const pktType = (header >> 4) & 0x0f;

      if (pktType === 2) {
        // CONNACK
        if (pkt.length >= 2 && pkt[1] === 0) {
          this.connected = true;
          this.onStatus("connected");
          for (const t of this.subTopics) {
            this.ws.send(buildSubscribePacket(this.packetId++, t));
          }
          clearInterval(this.pingTimer);
          this.pingTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(new Uint8Array([0xc0, 0x00])); // PINGREQ
            }
          }, 20000);
        } else {
          this.onStatus("error");
        }
      } else if (pktType === 3) {
        // PUBLISH
        if (pkt.length >= 2) {
          const tLen = (pkt[0] << 8) | pkt[1];
          let pos = 2 + tLen;
          const topic = new TextDecoder().decode(pkt.subarray(2, pos));
          const qos = (header >> 1) & 0x03;
          if (qos > 0) pos += 2;
          const payload = new TextDecoder().decode(pkt.subarray(pos));
          this.onMessage(topic, payload);
        }
      }
    }
  }

  subscribe(topic) {
    if (!this.subTopics.includes(topic)) this.subTopics.push(topic);
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(buildSubscribePacket(this.packetId++, topic));
    }
  }

  publish(topic, payloadStr) {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(buildPublishPacket(topic, payloadStr));
    }
  }

  disconnect() {
    clearInterval(this.pingTimer);
    this.pingTimer = null;
    this.connected = false;
    this.rxBuf = new Uint8Array(0);
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(new Uint8Array([0xe0, 0x00])); // DISCONNECT
        }
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }
  }
}
