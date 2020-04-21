import {createInbox} from "nats";

let NATS = require('nats');
let nsc = require("./_nats_server_control");
import test from 'ava';

test.before(async (t) => {
    let server = await nsc.startServer(["-p", "4222"]);
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

test('drain_conn', (t) => {
    return new Promise((resolve) => {
        // [begin drain_conn]
        let nc = NATS.connect({url: "nats://demo.nats.io:4222"});
        let inbox = createInbox();
        let counter = 0;
        nc.subscribe(inbox, () => {
            counter++;
        });

        nc.publish(inbox);
        nc.drain((err)=> {
            if(err) {
                t.log(err);
            }
            t.log('connection is closed:', nc.closed);
            t.log('processed', counter, 'messages');
            t.pass();
            // the snippet is running as a promise in a test
            // and calls resolve to pass the test
            resolve();
        });
        // [end drain_conn]
    });
});

