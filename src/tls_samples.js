import test from "ava";
import {join} from "path";
let fs = require('fs');
let NATS = require('nats');
let nsc = require("./_nats_server_control");

let serverCertPath = join(__dirname, "../certs/server-cert.pem");
let serverKeyPath = join(__dirname, "../certs/server-key.pem");
let caCertPath = join(__dirname, "../certs/ca.pem");
let clientCertPath = join(__dirname, "../certs/client-cert.pem");
let clientKeyPath = join(__dirname, "../certs/client-key.pem");

test.before(async (t) => {
    t.log(__dirname);

    let server = await nsc.startServer("", ["--tlscert", serverCertPath, "--tlskey", serverKeyPath]);
    t.context = {server: server};
});

test.after.always((t) => {
    nsc.stopServer(t.context.server);
});

test('connect_tls_url', (t) => {
    return new Promise((resolve, reject) => {
        // [begin connect_tls_url]
        let nc = NATS.connect({
            url: "tls://demo.nats.io:4443",
            tls: true
        });
        // [end connect_tls_url]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});


test('connect_tls',  (t) => {
    return new Promise((resolve, reject) => {
        let url = t.context.server.nats;
        // [begin connect_tls]
        let caCert = fs.readFileSync(caCertPath);
        let clientCert = fs.readFileSync(clientCertPath);
        let clientKey = fs.readFileSync(clientKeyPath);
        let nc = NATS.connect({
            url: url,
            tls: {
                ca: [caCert],
                key: [clientKey],
                cert: [clientCert]
            }
        });
        // [end connect_tls]
        nc.flush(() => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});