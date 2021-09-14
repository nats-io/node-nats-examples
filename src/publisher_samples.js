import test from "ava";
import { connect, createInbox, Empty, JSONCodec, StringCodec } from "nats";

test("publish_bytes", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  // [begin publish_bytes]
  const sc = StringCodec();
  nc.publish("updates", sc.encode("All is Well"));
  // [end publish_bytes]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("publish_json", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  // [begin publish_json]
  const jc = JSONCodec();
  nc.publish("updates", jc.encode({ ticker: "GOOG", price: 2868.87 }));
  // [end publish_json]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("publish_with_reply", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });

  // [begin publish_with_reply]
  // set up a subscription to process the request
  const sc = StringCodec();
  nc.subscribe("time", {
    callback: (_err, msg) => {
      msg.respond(sc.encode(new Date().toLocaleTimeString()));
    },
  });

  // create a subscription subject that the responding send replies to
  const inbox = createInbox();
  const sub = nc.subscribe(inbox, {
    max: 1,
    callback: (_err, msg) => {
      t.log(`the time is ${sc.decode(msg.data)}`);
    },
  });

  nc.publish("time", Empty, { reply: inbox });
  // [end publish_with_reply]
  await nc.flush();
  await sub.closed;
  await nc.close();
  t.pass();
});

test("request_reply", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  // [begin request_reply]
  // set up a subscription to process the request
  const sc = StringCodec();
  nc.subscribe("time", {
    callback: (_err, msg) => {
      msg.respond(sc.encode(new Date().toLocaleTimeString()));
    },
  });

  const r = await nc.request("time");
  t.log(sc.decode(r.data));
  // [end request_reply]

  await nc.close();
  t.pass();
});

test("flush", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  // [begin flush]
  const start = Date.now();
  nc.flush().then(() => {
    t.log("round trip completed in", Date.now() - start, "ms");
  });
  // [end flush]
  await nc.close();
  t.pass();
});

test("wildcard_tester", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  nc.subscribe("time.>", {
    callback: (_err, msg) => {
      // converting timezones correctly in node requires a library
      // this doesn't take into account *many* things.
      let time = "";
      switch (msg.subject) {
        case "time.us.east":
          time = new Date().toLocaleTimeString("en-us", {
            timeZone: "America/New_York",
          });
          break;
        case "time.us.central":
          time = new Date().toLocaleTimeString("en-us", {
            timeZone: "America/Chicago",
          });
          break;
        case "time.us.mountain":
          time = new Date().toLocaleTimeString("en-us", {
            timeZone: "America/Denver",
          });
          break;
        case "time.us.west":
          time = new Date().toLocaleTimeString("en-us", {
            timeZone: "America/Los_Angeles",
          });
          break;
        default:
          time = "I don't know what you are talking about Willis";
      }
      t.log(msg.subject, time);
    },
  });

  // [begin wildcard_tester]
  nc.publish("time.us.east");
  nc.publish("time.us.central");
  nc.publish("time.us.mountain");
  nc.publish("time.us.west");
  // [end wildcard_tester]
  await nc.flush();
  await nc.drain();
  t.pass();
});
