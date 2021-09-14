import test from "ava";
const { NatsServer } = require("./helpers/launcher");
import { join } from "path";
import { connect } from "nats";

const dir = process.cwd();
const serverCertPath = join(dir, "certs/server.pem");
const serverKeyPath = join(dir, "certs/key.pem");
const caCertPath = join(dir, "certs/ca.pem");
const clientCertPath = join(dir, "certs/client-cert.pem");
const clientKeyPath = join(dir, "certs/client-key.pem");

const tlsConfig = {
  host: "0.0.0.0",
  tls: {
    cert_file: serverCertPath,
    key_file: serverKeyPath,
    ca_file: caCertPath,
  },
};

test("connect_tls_url", async (t) => {
  // [begin connect_tls_url]
  // tls options available depend on the javascript
  // runtime, please verify the readme for the
  // client you are using for specific details
  // this example showing the node library
  const nc = await connect({
    servers: ["demo.nats.io:4443"],
    tls: true,
  });
  // [end connect_tls_url]
  t.pass();
});

test("connect_tls", async (t) => {
  const ns = await NatsServer.start(tlsConfig, t);
  // [begin connect_tls]
  // tls options available depend on the javascript
  // runtime, please verify the readme for the
  // client you are using for specific details
  // this example showing the node library
  const nc = await connect({
    port: ns.port,
    debug: true,
    tls: {
      caFile: caCertPath,
      keyFile: clientKeyPath,
      certFile: clientCertPath,
    },
  });
  // [end connect_tls]
  await nc.flush();
  await nc.close();
  await ns.stop();
  t.pass();
});
