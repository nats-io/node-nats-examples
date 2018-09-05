let NATS = require('nats');
let nsc = require("./_nats_server_control");
import test from 'ava';

let servers = [];
test.after.always((t) => {
    servers.forEach((s) => {
        nsc.stopServer(s);
    });
});


test('connect_userpass', async (t) => {
    let server =  await nsc.startServer("", ["--user", "myname", "--pass", "password"]);
    servers.push(server);

    return new Promise((resolve, reject) => {
        // [begin connect_userpass]
        let nc = NATS.connect({url: server.nats, user: "myname", pass: "password"});
        // [end connect_userpass]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });

        nc.on('error', (err) => {
           t.log(err);
        });
    });
});

test('connect_userpass_url', async (t) => {
    let server =  await nsc.startServer("", ["--user", "myname", "--pass", "password"]);
    servers.push(server);
    let port = new URL(server.ports.nats[0]).port;

    return new Promise((resolve, reject) => {
        // [begin connect_userpass_url]
        let url = `nats://myname:password@127.0.0.1:${port}`;
        let nc = NATS.connect(url);
        // [end connect_userpass_url]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });

        nc.on('error', (err) => {
            t.log(err);
        });
    });
});

test('connect_token_url', async (t) => {
    let server =  await nsc.startServer("", ["--auth", "mytoken!"]);
    servers.push(server);
    let port = new URL(server.ports.nats[0]).port;
    t.log('started', port);

    return new Promise((resolve, reject) => {
        // [begin connect_token_url]
        let url = `nats://mytoken!@127.0.0.1:${port}`;
        let nc = NATS.connect({url: url});
        // [end connect_token_url]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('connect_token', async (t) => {
    let server =  await nsc.startServer("", ["--auth", "mytoken!"]);
    servers.push(server);
    let port = new URL(server.ports.nats[0]).port;

    return new Promise((resolve, reject) => {
        // [begin connect_token]
        let nc = NATS.connect({url: `nats://127.0.0.1:${port}`, token: "mytoken!"});
        // [end connect_token]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});