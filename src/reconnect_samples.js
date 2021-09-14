import test from "ava";
import { connect, Status } from "nats";

test("reconnect_no_random", async (t) => {
  // [begin reconnect_no_random]
  const nc = await connect({
    noRandomize: false,
    servers: ["127.0.0.1:4443", "demo.nats.io"],
  });
  // [end reconnect_no_random]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("reconnect_none", async (t) => {
  // [begin reconnect_none]
  const nc = await connect({
    reconnect: false,
    servers: ["demo.nats.io"],
  });
  // [end reconnect_none]
  await nc.flush();
  await nc.drain();
  t.pass();
});

test("reconnect_10s", async (t) => {
  // [begin reconnect_10s]
  const nc = await connect({
    reconnectTimeWait: 10 * 1000, // 10s
    servers: ["demo.nats.io"],
  });
  // [end reconnect_10s]
  await nc.flush();
  await nc.drain();
  t.pass();
});

test("reconnect_10x", async (t) => {
  // [begin reconnect_10x]
  const nc = await connect({
    maxReconnectAttempts: 10,
    servers: ["demo.nats.io"],
  });
  // [end reconnect_10x]
  await nc.flush();
  await nc.drain();
  t.pass();
});

test("reconnect_event", async (t) => {
  // [begin reconnect_event]
  const nc = await connect({
    maxReconnectAttempts: 10,
    servers: ["demo.nats.io"],
  });

  (async () => {
    for await (const s of nc.status()) {
      switch (s.type) {
        case Status.Reconnect:
          t.log(`client reconnected - ${s.data}`);
          break;
        default:
      }
    }
  })().then();

  // [end reconnect_event]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("reconnect_5mb", (t) => {
  // [begin reconnect_5mb]
  // Reconnect buffer size is not configurable on node-nats
  // [end reconnect_5mb]
  t.pass();
});
