let NATS = require('nats');
import test from 'ava';


test('ping_20s', (t) => {
    return new Promise((resolve, reject) => {
        // [begin ping_20s]
        let nc = NATS.connect({
            pingInterval: 20*2000, //20s
            url: "nats://demo.nats.io:4222"
        });
        // [end ping_20s]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('ping_5', (t) => {
    return new Promise((resolve, reject) => {
        // [begin ping_5]
        let nc = NATS.connect({
            maxPingOut: 5,
            url: "nats://demo.nats.io:4222"
        });
        // [end ping_5]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('connect_pedantic', (t) => {
    return new Promise((resolve, reject) => {
        // [begin connect_pedantic]
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222",
            pedantic: true
        });

        // [end connect_pedantic]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('connect_verbose', (t) => {
    return new Promise((resolve, reject) => {
        // [begin connect_verbose]
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222",
            verbose: true
        });

        // [end connect_verbose]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('connect_name', (t) => {
    return new Promise((resolve, reject) => {
        // [begin connect_name]
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222",
            name: "my-connection"
        });

        // [end connect_name]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});
