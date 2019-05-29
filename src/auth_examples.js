import path from "path";

let NATS = require('nats');
let nsc = require("./_nats_server_control");
let url = require('url');
let nkeys = require('ts-nkeys');
import {next} from 'nuid';
import {writeFileSync} from 'fs';

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
    let port = url.parse(server.ports.nats[0]).port;

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
    let port = url.parse(server.ports.nats[0]).port;
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
    let port = url.parse(server.ports.nats[0]).port;

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

test('connect_nkey', async (t) => {
    const uSeed = 'SUAEL6GG2L2HIF7DUGZJGMRUFKXELGGYFMHF76UO2AYBG3K4YLWR3FKC2Q';
    const uPub = 'UD6OU4D3CIOGIDZVL4ANXU3NWXOW5DCDE2YPZDBHPBXCVKHSODUA4FKI';

    if (nsc.serverVersion()[0] < 2) {
        t.pass();
        return Promise.resolve(true);
    }
    let conf = `authorization: {
        users: [
            { nkey: UD6OU4D3CIOGIDZVL4ANXU3NWXOW5DCDE2YPZDBHPBXCVKHSODUA4FKI }
        ]
    }
    `;

    let confDir = (process.env.TRAVIS) ? process.env.TRAVIS_BUILD_DIR : process.env.TMPDIR;
    //@ts-ignore
    let fp = path.join(confDir, next() + '.conf');
    writeFileSync(fp, conf);

    let server = await nsc.startServer(['-c', fp]);
    servers.push(server);

    return new Promise((resolve, reject) => {
        // [begin connect_nkey]
        let nc = NATS.connect({
            url: server.nats,
            nkey: uPub,
            sigCB: function (nonce) {
                const sk = nkeys.fromSeed(Buffer.from(uSeed));
                return sk.sign(nonce);
            }
        });
        // [end connect_nkey]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });

    });
});

test('connect_creds', async (t) => {
    const uSeed = 'SUAIBDPBAUTWCWBKIO6XHQNINK5FWJW4OHLXC3HQ2KFE4PEJUA44CNHTC4';
    const uJWT = 'eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJFU1VQS1NSNFhGR0pLN0FHUk5ZRjc0STVQNTZHMkFGWERYQ01CUUdHSklKUEVNUVhMSDJBIiwiaWF0IjoxNTQ0MjE3NzU3LCJpc3MiOiJBQ1pTV0JKNFNZSUxLN1FWREVMTzY0VlgzRUZXQjZDWENQTUVCVUtBMzZNSkpRUlBYR0VFUTJXSiIsInN1YiI6IlVBSDQyVUc2UFY1NTJQNVNXTFdUQlAzSDNTNUJIQVZDTzJJRUtFWFVBTkpYUjc1SjYzUlE1V002IiwidHlwZSI6InVzZXIiLCJuYXRzIjp7InB1YiI6e30sInN1YiI6e319fQ.kCR9Erm9zzux4G6M-V2bp7wKMKgnSNqMBACX05nwePRWQa37aO_yObbhcJWFGYjo1Ix-oepOkoyVLxOJeuD8Bw';
    const accountPK = 'ACZSWBJ4SYILK7QVDELO64VX3EFWB6CXCPMEBUKA36MJJQRPXGEEQ2WJ';
    const accountJWT = 'eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJXVFdYVDNCT1JWSFNLQkc2T0pIVVdFQ01QRVdBNldZVEhNRzVEWkJBUUo1TUtGU1dHM1FRIiwiaWF0IjoxNTQ0MjE3NzU3LCJpc3MiOiJPQ0FUMzNNVFZVMlZVT0lNR05HVU5YSjY2QUgyUkxTREFGM01VQkNZQVk1UU1JTDY1TlFNNlhRRyIsInN1YiI6IkFDWlNXQko0U1lJTEs3UVZERUxPNjRWWDNFRldCNkNYQ1BNRUJVS0EzNk1KSlFSUFhHRUVRMldKIiwidHlwZSI6ImFjY291bnQiLCJuYXRzIjp7ImxpbWl0cyI6eyJzdWJzIjotMSwiY29ubiI6LTEsImltcG9ydHMiOi0xLCJleHBvcnRzIjotMSwiZGF0YSI6LTEsInBheWxvYWQiOi0xLCJ3aWxkY2FyZHMiOnRydWV9fX0.q-E7bBGTU0uoTmM9Vn7WaEHDzCUrqvPDb9mPMQbry_PNzVAjf0RG9vd15lGxW5lu7CuGVqpj4CYKhNDHluIJAg';
    const opJWT = 'eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJhdWQiOiJURVNUUyIsImV4cCI6MTg1OTEyMTI3NSwianRpIjoiWE5MWjZYWVBIVE1ESlFSTlFPSFVPSlFHV0NVN01JNVc1SlhDWk5YQllVS0VRVzY3STI1USIsImlhdCI6MTU0Mzc2MTI3NSwiaXNzIjoiT0NBVDMzTVRWVTJWVU9JTUdOR1VOWEo2NkFIMlJMU0RBRjNNVUJDWUFZNVFNSUw2NU5RTTZYUUciLCJuYW1lIjoiU3luYWRpYSBDb21tdW5pY2F0aW9ucyBJbmMuIiwibmJmIjoxNTQzNzYxMjc1LCJzdWIiOiJPQ0FUMzNNVFZVMlZVT0lNR05HVU5YSjY2QUgyUkxTREFGM01VQkNZQVk1UU1JTDY1TlFNNlhRRyIsInR5cGUiOiJvcGVyYXRvciIsIm5hdHMiOnsic2lnbmluZ19rZXlzIjpbIk9EU0tSN01ZRlFaNU1NQUo2RlBNRUVUQ1RFM1JJSE9GTFRZUEpSTUFWVk40T0xWMllZQU1IQ0FDIiwiT0RTS0FDU1JCV1A1MzdEWkRSVko2NTdKT0lHT1BPUTZLRzdUNEhONk9LNEY2SUVDR1hEQUhOUDIiLCJPRFNLSTM2TFpCNDRPWTVJVkNSNlA1MkZaSlpZTVlXWlZXTlVEVExFWjVUSzJQTjNPRU1SVEFCUiJdfX0.hyfz6E39BMUh0GLzovFfk3wT4OfualftjdJ_eYkLfPvu5tZubYQ_Pn9oFYGCV_6yKy3KMGhWGUCyCdHaPhalBw';


    if (nsc.serverVersion()[0] < 2) {
        t.pass();
        return Promise.resolve(true);
    }
    let confDir = (process.env.TRAVIS) ? process.env.TRAVIS_BUILD_DIR : process.env.TMPDIR;

    let operatorJwtPath = path.join(confDir, next() + '.jwt');
    writeFileSync(operatorJwtPath, opJWT);

    let creds = `
    -----BEGIN NATS USER JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJFU1VQS1NSNFhGR0pLN0FHUk5ZRjc0STVQNTZHMkFGWERYQ01CUUdHSklKUEVNUVhMSDJBIiwiaWF0IjoxNTQ0MjE3NzU3LCJpc3MiOiJBQ1pTV0JKNFNZSUxLN1FWREVMTzY0VlgzRUZXQjZDWENQTUVCVUtBMzZNSkpRUlBYR0VFUTJXSiIsInN1YiI6IlVBSDQyVUc2UFY1NTJQNVNXTFdUQlAzSDNTNUJIQVZDTzJJRUtFWFVBTkpYUjc1SjYzUlE1V002IiwidHlwZSI6InVzZXIiLCJuYXRzIjp7InB1YiI6e30sInN1YiI6e319fQ.kCR9Erm9zzux4G6M-V2bp7wKMKgnSNqMBACX05nwePRWQa37aO_yObbhcJWFGYjo1Ix-oepOkoyVLxOJeuD8Bw
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUAIBDPBAUTWCWBKIO6XHQNINK5FWJW4OHLXC3HQ2KFE4PEJUA44CNHTC4
------END USER NKEY SEED------
    `;

    let testCreds = path.join(confDir, next() + '.creds');
    writeFileSync(testCreds, creds);


    let conf = `operator: ${operatorJwtPath}
    resolver: 'MEMORY'
    resolver_preload: {
        ${accountPK}: ${accountJWT}
    }
    `;
    //@ts-ignore
    let fp = path.join(confDir, next() + '.conf');
    writeFileSync(fp, conf);

    let server = await nsc.startServer(['-c', fp]);
    servers.push(server);

    return new Promise((resolve, reject) => {
        // [begin connect_creds]
        let nc = NATS.connect({
            url: server.nats,
            userCreds: testCreds
        });
        // [end connect_creds]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });

    });
});
