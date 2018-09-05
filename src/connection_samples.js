let NATS = require('nats');
let nsc = require("./_nats_server_control");
import test from 'ava';

test.before(async (t) => {
    let server = await nsc.startServer("", ["-p", "4222"]);
    t.context = {server: server};
});

test.after.always((t) => {
    // @ts-ignore
    nsc.stopServer(t.context.server);
});

test('connect_default', (t) => {
    t.plan(1);
    return new Promise((resolve, failed) => {
        function doSomething() {
            t.pass();
            resolve();
        }
        // [begin connect_default]
        let nc = NATS.connect();
        nc.on('connect', (c) => {
            // Do something with the connection
            doSomething();
            // When done close it
            nc.close();
        });
        nc.on('error', (err) => {
            failed(err);
        });
        // [end connect_default]
    });
});


test('connect_url', (t) => {
    t.plan(1);
    return new Promise((resolve, failed) => {
        function doSomething() {
            t.pass();
            resolve();
        }
        // [begin connect_url]
        let nc = NATS.connect("nats://demo.nats.io:4222");
        nc.on('connect', (c) => {
            // Do something with the connection
            doSomething();
            // When done close it
            nc.close();
        });
        nc.on('error', (err) => {
            failed(err);
        });
        // [end connect_url]
    });
});

test('connect_multiple', (t) => {
    t.plan(1);
    return new Promise((resolve, failed) => {
        function doSomething() {
            t.pass();
            resolve();
        }
        // [begin connect_multiple]
        let nc = NATS.connect({
            servers: [
                "nats://demo.nats.io:4222",
                "nats://localhost:4222"
            ]}
        );

        nc.on('connect', (c) => {
            // Do something with the connection
            doSomething();
            // When done close it
            nc.close();
        });
        nc.on('error', (err) => {
            failed(err);
        });
        // [end connect_multiple]
    });
});

