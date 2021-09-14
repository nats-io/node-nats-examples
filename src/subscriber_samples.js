import test from "ava";
import { connect, createInbox, StringCodec } from "nats";
import { JSONCodec } from "nats/lib/nats-base-client/codec";

test("subscribe_async", async (t) => {
  const nc = await connect({
    servers: ["demo.nats.io"],
  });
  setTimeout(() => {
    nc.publish("updates", StringCodec().encode("hello!"));
  });
  // [begin subscribe_async]
  const sc = StringCodec();
  // this is an example of a callback subscription
  // https://github.com/nats-io/nats.js/blob/master/README.md#async-vs-callbacks
  nc.subscribe("updates", {
    callback: (err, msg) => {
      if (err) {
        t.error(err.message);
      } else {
        t.log(sc.decode(msg.data));
      }
    },
    max: 1,
  });

  // here's an iterator subscription - note the code in the
  // for loop will block until the iterator completes
  // either from a break/return from the iterator, an
  // unsubscribe after the message arrives, or in this case
  // an auto-unsubscribe after the first message is received
  const sub = nc.subscribe("updates", { max: 1 });
  for await (const m of sub) {
    t.log(sc.decode(m.data));
  }

  // subscriptions have notifications, simply wait
  // the closed promise
  sub.closed
    .then(() => {
      t.log("subscription closed");
    })
    .catch((err) => {
      t.err(`subscription closed with an error ${err.message}`);
    });
  // [end subscribe_async]
  await nc.flush();
  await nc.drain();
  t.pass();
});

test("subscribe_w_reply", async (t) => {
  const nc = await connect({
    servers: ["demo.nats.io"],
  });
  setTimeout(async () => {
    const r = await nc.request("time");
    t.log(sc.decode(r.data));
    await nc.drain();
  });
  // [begin subscribe_w_reply]
  const sc = StringCodec();
  // set up a subscription to process a request
  const sub = nc.subscribe("time");
  for await (const m of sub) {
    m.respond(sc.encode(new Date().toLocaleDateString()));
  }
  // [end subscribe_w_reply]
  t.pass();
});

test("unsubscribe", async (t) => {
  const nc = await connect({
    servers: ["demo.nats.io"],
  });
  // [begin unsubscribe]
  const sc = StringCodec();
  // set up a subscription to process a request
  const sub = nc.subscribe(createInbox(), (_err, m) => {
    m.respond(sc.encode(new Date().toLocaleTimeString()));
  });
  // without arguments the subscription will cancel when the server receives it
  // you can also specify how many messages are expected by the subscription
  sub.unsubscribe();
  // [end unsubscribe]
  await sub.closed;
  await nc.close();
  t.pass();
});

test("subscribe_json", async (t) => {
  const nc = await connect({
    servers: ["demo.nats.io"],
  });
  const subj = createInbox();
  // [begin subscribe_json]
  const jc = JSONCodec();
  const sub = nc.subscribe(subj, {
    callback: (_err, msg) => {
      t.log(`${jc.decode(msg.data)}`);
    },
    max: 1,
  });
  // [end subscribe_json]
  nc.publish(subj, jc.encode({ ticker: "TSLA", price: 744.49 }));
  await sub.closed;
  await nc.close();
  t.pass();
});

test("unsubscribe_auto", async (t) => {
  const nc = await connect({
    servers: ["demo.nats.io"],
  });
  // [begin unsubscribe_auto]
  const sc = StringCodec();
  // `max` specifies the number of messages that the server will forward.
  // The server will auto-cancel.
  const subj = createInbox();
  const sub1 = nc.subscribe(subj, {
    callback: (_err, msg) => {
      t.log(`sub1 ${sc.decode(msg.data)}`);
    },
    max: 10,
  });

  // another way after 10 messages
  const sub2 = nc.subscribe(subj, {
    callback: (_err, msg) => {
      t.log(`sub2 ${sc.decode(msg.data)}`);
    },
  });

  // if the subscription already received 10 messages, the handler
  // won't get any more messages
  sub2.unsubscribe(10);
  // [end unsubscribe_auto]

  for (let i = 0; i < 10; i++) {
    nc.publish(subj, sc.encode(String(i)));
  }

  await sub1.closed;
  await sub2.closed;
  await nc.close();
  t.pass();
});

test("subscribe_star", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  // [begin subscribe_star]
  nc.subscribe("time.us.*", (_err, msg) => {
    // converting timezones correctly in node requires a library
    // this doesn't take into account *many* things.
    let time;
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
    t.log(subject, time);
  });
  // [end subscribe_star]
  nc.publish("time.us.east");
  nc.publish("time.us.central");
  nc.publish("time.us.mountain");
  nc.publish("time.us.west");
  await nc.drain();
  t.pass();
});

test("subscribe_arrow", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  // [begin subscribe_arrow]
  nc.subscribe("time.>", (msg, reply, subject) => {
    // converting timezones correctly in node requires a library
    // this doesn't take into account *many* things.
    let time = "";
    switch (subject) {
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
    t.log(subject, time);
  });
  // [end subscribe_arrow]
  nc.publish("time.us.east");
  nc.publish("time.us.central");
  nc.publish("time.us.mountain");
  nc.publish("time.us.west");
  await nc.drain();
  t.pass();
});

test("subscribe_queue", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  const subj = createInbox();
  // [begin subscribe_queue]
  nc.subscribe(subj, {
    queue: "workers",
    callback: (_err, _msg) => {
      t.log("worker1 got message");
    },
  });

  nc.subscribe(subj, {
    queue: "workers",
    callback: (_err, _msg) => {
      t.log("worker2 got message");
    },
  });
  // [end subscribe_queue]
  nc.publish(subj);
  await nc.drain();
  t.pass();
});

test("drain_sub", async (t) => {
  const nc = await connect({ servers: ["demo.nats.io"] });
  const subj = createInbox();
  // [begin drain_sub]
  const sub = nc.subscribe(subj, { callback: (_err, _msg) => {} });
  nc.publish(subj);
  nc.publish(subj);
  nc.publish(subj);
  await sub.drain();
  t.is(sub.getProcessed(), 3);

  // [end drain_sub]
  await sub.closed;
  await nc.close();
  t.pass();
});

test("no_echo", async (t) => {
  const subj = createInbox();
  // [begin no_echo]
  const nc = await connect({
    servers: ["demo.nats.io"],
    noEcho: true,
  });

  const sub = nc.subscribe(subj, { callback: (_err, _msg) => {} });
  nc.publish(subj);
  await sub.drain();
  // we won't get our own messages
  t.is(sub.getProcessed(), 0);
  // [end no_echo]
  await nc.close();
});

test("subscribe_sync", (t) => {
  // [begin subscribe_sync]
  // node-nats subscriptions are always async.
  // [end subscribe_sync]
  t.pass();
});
