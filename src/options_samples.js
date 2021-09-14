import test from "ava";
import { connect } from "nats";

test("ping_20s", async (t) => {
  // [begin ping_20s]
  const nc = await connect({
    pingInterval: 20 * 1000,
    servers: ["demo.nats.io:4222"],
  });
  // [end ping_20s]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("ping_5", async (t) => {
  // [begin ping_5]
  const nc = await connect({
    maxPingOut: 5,
    servers: ["demo.nats.io:4222"],
  });
  // [end ping_5]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("connect_pedantic", async (t) => {
  // [begin connect_pedantic]
  // the pedantic option is useful for developing nats clients.
  // the javascript clients also provide `debug` which will
  // print to the console all the protocol interactions
  // with the server
  const nc = await connect({
    pedantic: true,
    servers: ["demo.nats.io:4222"],
    debug: true,
  });
  // [end connect_pedantic]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("connect_verbose", async (t) => {
  // [begin connect_verbose]
  const nc = await connect({
    verbose: true,
    servers: ["demo.nats.io:4222"],
  });

  // [end connect_verbose]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("connect_name", async (t) => {
  // [begin connect_name]
  const nc = await connect({
    name: "my-connection",
    servers: ["demo.nats.io:4222"],
  });
  // [end connect_name]
  await nc.flush();
  await nc.close();
  t.pass();
});

test("control_2k", async (t) => {
  // [begin control_2k]
  // the max control line is determined automatically by the client
  // [end control_2k]
  t.pass();
});

test("slow_pending_limits", (t) => {
  // [begin slow_pending_limits]
  // slow pending limits are not configurable on node-nats
  // [end slow_pending_limits]
  t.pass();
});

test("slow_listener", (t) => {
  // [begin slow_listener]
  // slow consumer detection is not configurable on node-nats
  // [end slow_listener]
  t.pass();
});

test("connect_options", async (t) => {
  // [begin connect_options]
  // timeout of 2 seconds if we fail to establish a connection
  const nc = await connect({
    timeout: 2 * 1000,
    servers: ["demo.nats.io:4222"],
  });
  // [end connect_options]
  await nc.close();
  t.pass();
});
