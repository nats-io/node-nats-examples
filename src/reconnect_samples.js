let NATS = require('nats');
import test from 'ava';

test('reconnect_no_random', async (t) => {
    return new Promise((resolve, reject) => {
        // [begin reconnect_no_random]
        let nc = NATS.connect({
            noRandomize: false,
            servers: ["nats://127.0.0.1:4443",
                "nats://demo.nats.io:4222"
            ]
        });
        // [end reconnect_no_random]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });

});

test('reconnect_none', async (t) => {
    return new Promise((resolve, reject) => {
        // [begin reconnect_none]
        let nc = NATS.connect({
            reconnect: false,
            servers: ["nats://demo.nats.io:4222"]
        });
        // [end reconnect_none]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});


test('reconnect_10s', async (t) => {
    return new Promise((resolve, reject) => {
        // [begin reconnect_10s]
        let nc = NATS.connect({
            reconnectTimeWait: 10 * 1000, //10s
            servers: ["nats://demo.nats.io:4222"]
        });
        // [end reconnect_10s]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('reconnect_10x', async (t) => {
    return new Promise((resolve, reject) => {
        // [begin reconnect_10x]
        let nc = NATS.connect({
            maxReconnectAttempts: 10,
            servers: ["nats://demo.nats.io:4222"]
        });
        // [end reconnect_10x]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('reconnect_event', async (t) => {
    return new Promise((resolve, reject) => {
        // [begin reconnect_event]
        let nc = NATS.connect({
            maxReconnectAttempts: 10,
            servers: ["nats://demo.nats.io:4222"]
        });

        nc.on('reconnect', (c) => {
            console.log('reconnected');
        });
        // [end reconnect_event]
        t.pass();
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });

});



