import test from "ava";
import { connect, Status } from "nats";

test("connection_listener", async (t) => {
  // [begin connection_listener]
  const nc = await connect({ servers: ["demo.nats.io"] });
  nc.closed().then(() => {
    t.log("the connection closed!");
  });

  (async () => {
    for await (const s of nc.status()) {
      switch (s.type) {
        case Status.Disconnect:
          t.log(`client disconnected - ${s.data}`);
          break;
        case Status.LDM:
          t.log("client has been requested to reconnect");
          break;
        case Status.Update:
          t.log(`client received a cluster update - ${s.data}`);
          break;
        case Status.Reconnect:
          t.log(`client reconnected - ${s.data}`);
          break;
        case Status.Error:
          t.log("client got a permissions error");
          break;
        case DebugEvents.Reconnecting:
          t.log("client is attempting to reconnect");
          break;
        case DebugEvents.StaleConnection:
          t.log("client has a stale connection");
          break;
        default:
          t.log(`got an unknown status ${s.type}`);
      }
    }
  })().then();

  // [end connection_listener]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("servers_added", async (t) => {
  // [begin servers_added]
  const nc = await connect({ servers: ["demo.nats.io:4222"] });
  (async () => {
    for await (const s of nc.status()) {
      switch (s.type) {
        case Status.Update:
          t.log(`servers added - ${s.data.added}`);
          t.log(`servers deleted - ${s.data.deleted}`);
          break;
        default:
      }
    }
  })().then();
  // [end servers_added]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("error_listener", async (t) => {
  // [begin error_listener]
  const nc = await connect({ servers: ["demo.nats.io"] });

  // if the client gets closed with an error you can trap that
  // condition in the closed handler like this:
  nc.closed().then((err) => {
    if (err) {
      t.log(`the connection closed with an error ${err.message}`);
    } else {
      t.log(`the connection closed.`);
    }
  });

  // if you have a status listener, it will too get notified
  (async () => {
    for await (const s of nc.status()) {
      switch (s.type) {
        case Status.Error:
          // typically if you get this the nats connection will close
          t.log("client got an async error from the server");
          break;
        default:
          t.log(`got an unknown status ${s.type}`);
      }
    }
  })().then();
  // [end error_listener]
  await nc.close();
  t.pass();
});

test("connect_status", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io:4222"] });
  // [begin connect_status]
  // you can find out where you connected:
  t.log(`connected to a nats server version ${nc.info.version}`);

  // or information about the data in/out of the client:
  const stats = nc.stats();
  t.log(`client sent ${stats.outMsgs} messages and received ${stats.inMsgs}`);
  // [end connect_status]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("max_payload", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io:4222"] });
  // [begin max_payload]
  t.log(`max payload for the server is ${nc.info.max_payload} bytes`);
  // [end max_payload]
  await nc.flush();
  await nc.close();
  t.pass();
});
