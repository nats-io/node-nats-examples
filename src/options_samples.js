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

test('control_2k', (t) => {
    return new Promise((resolve, reject) => {
        // [begin control_2k]
        // set this option before creating a connection
        NATS.MAX_CONTROL_LINE_SIZE = 1024*2;
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222"
        });

        // [end control_2k]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('slow_pending_limits', (t) => {
    // [begin slow_pending_limits]
    // slow pending limits are not configurable on node-nats
    // [end slow_pending_limits]
    t.pass();
});

test('sub_pending_limits', (t) => {
    // [begin sub_pending_limits]
    // subscription limits are not configurable on node-nats
    // [end sub_pending_limits]
    t.pass();
});

test('slow_listener', (t) => {
    // [begin slow_listener]
    // slow consumer detection is not configurable on node-nats
    // [end slow_listener]
    t.pass();
});

test('connect_options', (t) => {
    // [begin connect_options]
    // connection timeout is not supported on node-nats
    // [end connect_options]
    t.pass();
});
