import test from "ava";
const { NatsServer } = require("./helpers/launcher");
import { connect, credsAuthenticator, nkeyAuthenticator } from "nats";

const conf = {
  authorization: {
    PERM: {
      subscribe: "bar",
      publish: "foo",
    },
    users: [{
      user: "byname",
      password: "password",
      permission: "$PERM",
    }, {
      nkey: "UD6OU4D3CIOGIDZVL4ANXU3NWXOW5DCDE2YPZDBHPBXCVKHSODUA4FKI",
    }],
  },
};

test("connect_userpass", async (t) => {
  try {
    const ns = await NatsServer.start(conf);
    // [begin connect_userpass]
    const nc = await connect({
      port: ns.port,
      user: "byname",
      pass: "password",
    });
    // [end connect_userpass]
    t.pass();
    await nc.close();
    await ns.stop();
  } catch (err) {
    t.fail(err);
  }
});

test("connect_userpass_url", async (t) => {
  // [begin connect_userpass_url]
  // JavaScript clients don't support username/password in urls use `user` and `pass` options.
  // [end connect_userpass_url]
  t.pass();
});

test("connect_token_url", async (t) => {
  // [begin connect_token_url]
  // JavaScript doesn't support tokens in urls use the `token` option
  // [end connect_token_url]
  t.pass();
});

test("connect_token", async (t) => {
  const ns = await NatsServer.start({
    authorization: {
      token: "aToK3n",
    },
  });
  // [begin connect_token]
  const nc = await connect({
    port: ns.port,
    token: "aToK3n",
  });
  // [end connect_token]
  t.pass();
  await nc.close();
  await ns.stop();
});

test("connect_nkey", async (t) => {
  const ns = await NatsServer.start(conf);
  // [begin connect_nkey]
  // seed should be stored and treated like a secret
  const seed = new TextEncoder().encode(
    "SUAEL6GG2L2HIF7DUGZJGMRUFKXELGGYFMHF76UO2AYBG3K4YLWR3FKC2Q",
  );
  const nc = await connect({
    port: ns.port,
    authenticator: nkeyAuthenticator(seed),
  });
  // [end connect_nkey]
  t.pass();
  await nc.close();
  await ns.stop();
});

test("connect_creds", async (t) => {
  const accountJWT =
    "eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJXVFdYVDNCT1JWSFNLQkc2T0pIVVdFQ01QRVdBNldZVEhNRzVEWkJBUUo1TUtGU1dHM1FRIiwiaWF0IjoxNTQ0MjE3NzU3LCJpc3MiOiJPQ0FUMzNNVFZVMlZVT0lNR05HVU5YSjY2QUgyUkxTREFGM01VQkNZQVk1UU1JTDY1TlFNNlhRRyIsInN1YiI6IkFDWlNXQko0U1lJTEs3UVZERUxPNjRWWDNFRldCNkNYQ1BNRUJVS0EzNk1KSlFSUFhHRUVRMldKIiwidHlwZSI6ImFjY291bnQiLCJuYXRzIjp7ImxpbWl0cyI6eyJzdWJzIjotMSwiY29ubiI6LTEsImltcG9ydHMiOi0xLCJleHBvcnRzIjotMSwiZGF0YSI6LTEsInBheWxvYWQiOi0xLCJ3aWxkY2FyZHMiOnRydWV9fX0.q-E7bBGTU0uoTmM9Vn7WaEHDzCUrqvPDb9mPMQbry_PNzVAjf0RG9vd15lGxW5lu7CuGVqpj4CYKhNDHluIJAg";
  const opJWT =
    "eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJhdWQiOiJURVNUUyIsImV4cCI6MTg1OTEyMTI3NSwianRpIjoiWE5MWjZYWVBIVE1ESlFSTlFPSFVPSlFHV0NVN01JNVc1SlhDWk5YQllVS0VRVzY3STI1USIsImlhdCI6MTU0Mzc2MTI3NSwiaXNzIjoiT0NBVDMzTVRWVTJWVU9JTUdOR1VOWEo2NkFIMlJMU0RBRjNNVUJDWUFZNVFNSUw2NU5RTTZYUUciLCJuYW1lIjoiU3luYWRpYSBDb21tdW5pY2F0aW9ucyBJbmMuIiwibmJmIjoxNTQzNzYxMjc1LCJzdWIiOiJPQ0FUMzNNVFZVMlZVT0lNR05HVU5YSjY2QUgyUkxTREFGM01VQkNZQVk1UU1JTDY1TlFNNlhRRyIsInR5cGUiOiJvcGVyYXRvciIsIm5hdHMiOnsic2lnbmluZ19rZXlzIjpbIk9EU0tSN01ZRlFaNU1NQUo2RlBNRUVUQ1RFM1JJSE9GTFRZUEpSTUFWVk40T0xWMllZQU1IQ0FDIiwiT0RTS0FDU1JCV1A1MzdEWkRSVko2NTdKT0lHT1BPUTZLRzdUNEhONk9LNEY2SUVDR1hEQUhOUDIiLCJPRFNLSTM2TFpCNDRPWTVJVkNSNlA1MkZaSlpZTVlXWlZXTlVEVExFWjVUSzJQTjNPRU1SVEFCUiJdfX0.hyfz6E39BMUh0GLzovFfk3wT4OfualftjdJ_eYkLfPvu5tZubYQ_Pn9oFYGCV_6yKy3KMGhWGUCyCdHaPhalBw";

  const creds = new TextEncoder().encode(`
    -----BEGIN NATS USER JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJFU1VQS1NSNFhGR0pLN0FHUk5ZRjc0STVQNTZHMkFGWERYQ01CUUdHSklKUEVNUVhMSDJBIiwiaWF0IjoxNTQ0MjE3NzU3LCJpc3MiOiJBQ1pTV0JKNFNZSUxLN1FWREVMTzY0VlgzRUZXQjZDWENQTUVCVUtBMzZNSkpRUlBYR0VFUTJXSiIsInN1YiI6IlVBSDQyVUc2UFY1NTJQNVNXTFdUQlAzSDNTNUJIQVZDTzJJRUtFWFVBTkpYUjc1SjYzUlE1V002IiwidHlwZSI6InVzZXIiLCJuYXRzIjp7InB1YiI6e30sInN1YiI6e319fQ.kCR9Erm9zzux4G6M-V2bp7wKMKgnSNqMBACX05nwePRWQa37aO_yObbhcJWFGYjo1Ix-oepOkoyVLxOJeuD8Bw
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUAIBDPBAUTWCWBKIO6XHQNINK5FWJW4OHLXC3HQ2KFE4PEJUA44CNHTC4
------END USER NKEY SEED------
    `);

  const conf = {
    operator: opJWT,
    resolver: "MEMORY",
    resolver_preload: {
      ACZSWBJ4SYILK7QVDELO64VX3EFWB6CXCPMEBUKA36MJJQRPXGEEQ2WJ: accountJWT,
    },
  };

  const ns = await NatsServer.start(conf);
  // [begin connect_creds]
  // credentials file contains the JWT and the secret signing key
  const authenticator = credsAuthenticator(creds);
  const nc = await connect({
    port: ns.port,
    authenticator: authenticator,
  });
  // [end connect_creds]
  t.pass();
  await nc.close();
  await ns.stop();
});
