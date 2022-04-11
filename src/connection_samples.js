import test from "ava";
const { NatsServer } = require("./helpers/launcher");
import { connect, createInbox } from "nats";

const conf = {
  authorization: {
    token: "aToK3n",
    PERM: {
      subscribe: "bar",
      publish: "foo",
    },
    users: [{
      user: "byname",
      password: "password",
      permission: "$PERM",
    }, {
      user: "withnkey",
      nkey: "UD6OU4D3CIOGIDZVL4ANXU3NWXOW5DCDE2YPZDBHPBXCVKHSODUA4FKI",
    }],
  },
};

function doSomething() {}

test("connect_default", async (t) => {
  const ns = await NatsServer.start({ port: 4222 });
  // [begin connect_default]
  const nc = await connect();
  // Do something with the connection
  doSomething();
  // When done close it
  await nc.close();
  // [end connect_default]
  t.pass();
  await ns.stop();
});

test("connect_url", async (t) => {
  // [begin connect_url]
  const nc = await connect({ servers: "demo.nats.io" });
  // Do something with the connection
  doSomething();
  await nc.close();
  // [end connect_url
  t.pass();
});

test("connect_multiple", async (t) => {
  // [begin connect_multiple]
  const nc = await connect({
    servers: [
      "nats://demo.nats.io:4222",
      "nats://localhost:4222",
    ],
  });
  // Do something with the connection
  doSomething();
  // When done close it
  await nc.close();
  // [end connect_multiple]
  t.pass();
});

test("drain_conn", async (t) => {
  // [begin drain_conn]
  const nc = await connect({ servers: "demo.nats.io" });
  const sub = nc.subscribe(createInbox(), () => {});
  nc.publish(sub.getSubject());
  await nc.drain();
  // [end drain_conn]
  t.pass();
});
