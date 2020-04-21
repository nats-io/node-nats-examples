import path from 'path'
import { next } from 'nuid'
import { writeFileSync } from 'fs'

import test from 'ava'

const NATS = require('nats')
const nsc = require('./_nats_server_control')
const url = require('url')
const nkeys = require('ts-nkeys')

const servers = []
test.after.always(() => {
  servers.forEach((s) => {
    nsc.stopServer(s)
  })
})

test('connect_userpass', async (t) => {
  const server = await nsc.startServer(['--user', 'myname', '--pass', 'password'])
  servers.push(server)

  return new Promise((resolve) => {
    // [begin connect_userpass]
    const nc = NATS.connect({ url: server.nats, user: 'myname', pass: 'password' })
    // [end connect_userpass]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })

    nc.on('error', (err) => {
      t.log(err)
    })
  })
})

test('connect_userpass_url', async (t) => {
  const server = await nsc.startServer(['--user', 'myname', '--pass', 'password'])
  servers.push(server)
  const port = new url.URL(server.ports.nats[0]).port

  return new Promise((resolve) => {
    // [begin connect_userpass_url]
    const url = `nats://myname:password@127.0.0.1:${port}`
    const nc = NATS.connect(url)
    // [end connect_userpass_url]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })

    nc.on('error', (err) => {
      t.log(err)
    })
  })
})

test('connect_token_url', async (t) => {
  const server = await nsc.startServer(['--auth', 'mytoken!'])
  servers.push(server)
  const port = new url.URL(server.ports.nats[0]).port
  t.log('started', port)

  return new Promise((resolve) => {
    // [begin connect_token_url]
    const url = `nats://mytoken!@127.0.0.1:${port}`
    const nc = NATS.connect({ url: url })
    // [end connect_token_url]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('connect_token', async (t) => {
  const server = await nsc.startServer(['--auth', 'mytoken!'])
  servers.push(server)
  const port = new url.URL(server.ports.nats[0]).port

  return new Promise((resolve) => {
    // [begin connect_token]
    const nc = NATS.connect({ url: `nats://127.0.0.1:${port}`, token: 'mytoken!' })
    // [end connect_token]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('connect_nkey', async (t) => {
  if (nsc.serverVersion()[0] < 2) {
    t.pass()
    return Promise.resolve(true)
  }
  const conf = `authorization: {
        users: [
            { nkey: UD6OU4D3CIOGIDZVL4ANXU3NWXOW5DCDE2YPZDBHPBXCVKHSODUA4FKI }
        ]
    }
    `

  const confDir = (process.env.TRAVIS) ? process.env.TRAVIS_BUILD_DIR : process.env.TMPDIR
  // @ts-ignore
  const fp = path.join(confDir, next() + '.conf')
  writeFileSync(fp, conf)

  const server = await nsc.startServer(['-c', fp])
  servers.push(server)

  return new Promise((resolve) => {
    // [begin connect_nkey]
    // seed should be stored in a file and treated like a secret
    const seed = 'SUAEL6GG2L2HIF7DUGZJGMRUFKXELGGYFMHF76UO2AYBG3K4YLWR3FKC2Q'

    const nc = NATS.connect({
      url: server.nats,
      nkey: 'UD6OU4D3CIOGIDZVL4ANXU3NWXOW5DCDE2YPZDBHPBXCVKHSODUA4FKI',
      nonceSigner: function (nonce) {
        const sk = nkeys.fromSeed(Buffer.from(seed))
        return sk.sign(nonce)
      }
    })
    // [end connect_nkey]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('connect_creds', async (t) => {
  const accountPK = 'ACZSWBJ4SYILK7QVDELO64VX3EFWB6CXCPMEBUKA36MJJQRPXGEEQ2WJ'
  const accountJWT = 'eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJXVFdYVDNCT1JWSFNLQkc2T0pIVVdFQ01QRVdBNldZVEhNRzVEWkJBUUo1TUtGU1dHM1FRIiwiaWF0IjoxNTQ0MjE3NzU3LCJpc3MiOiJPQ0FUMzNNVFZVMlZVT0lNR05HVU5YSjY2QUgyUkxTREFGM01VQkNZQVk1UU1JTDY1TlFNNlhRRyIsInN1YiI6IkFDWlNXQko0U1lJTEs3UVZERUxPNjRWWDNFRldCNkNYQ1BNRUJVS0EzNk1KSlFSUFhHRUVRMldKIiwidHlwZSI6ImFjY291bnQiLCJuYXRzIjp7ImxpbWl0cyI6eyJzdWJzIjotMSwiY29ubiI6LTEsImltcG9ydHMiOi0xLCJleHBvcnRzIjotMSwiZGF0YSI6LTEsInBheWxvYWQiOi0xLCJ3aWxkY2FyZHMiOnRydWV9fX0.q-E7bBGTU0uoTmM9Vn7WaEHDzCUrqvPDb9mPMQbry_PNzVAjf0RG9vd15lGxW5lu7CuGVqpj4CYKhNDHluIJAg'
  const opJWT = 'eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJhdWQiOiJURVNUUyIsImV4cCI6MTg1OTEyMTI3NSwianRpIjoiWE5MWjZYWVBIVE1ESlFSTlFPSFVPSlFHV0NVN01JNVc1SlhDWk5YQllVS0VRVzY3STI1USIsImlhdCI6MTU0Mzc2MTI3NSwiaXNzIjoiT0NBVDMzTVRWVTJWVU9JTUdOR1VOWEo2NkFIMlJMU0RBRjNNVUJDWUFZNVFNSUw2NU5RTTZYUUciLCJuYW1lIjoiU3luYWRpYSBDb21tdW5pY2F0aW9ucyBJbmMuIiwibmJmIjoxNTQzNzYxMjc1LCJzdWIiOiJPQ0FUMzNNVFZVMlZVT0lNR05HVU5YSjY2QUgyUkxTREFGM01VQkNZQVk1UU1JTDY1TlFNNlhRRyIsInR5cGUiOiJvcGVyYXRvciIsIm5hdHMiOnsic2lnbmluZ19rZXlzIjpbIk9EU0tSN01ZRlFaNU1NQUo2RlBNRUVUQ1RFM1JJSE9GTFRZUEpSTUFWVk40T0xWMllZQU1IQ0FDIiwiT0RTS0FDU1JCV1A1MzdEWkRSVko2NTdKT0lHT1BPUTZLRzdUNEhONk9LNEY2SUVDR1hEQUhOUDIiLCJPRFNLSTM2TFpCNDRPWTVJVkNSNlA1MkZaSlpZTVlXWlZXTlVEVExFWjVUSzJQTjNPRU1SVEFCUiJdfX0.hyfz6E39BMUh0GLzovFfk3wT4OfualftjdJ_eYkLfPvu5tZubYQ_Pn9oFYGCV_6yKy3KMGhWGUCyCdHaPhalBw'

  if (nsc.serverVersion()[0] < 2) {
    t.pass()
    return Promise.resolve(true)
  }
  const confDir = (process.env.TRAVIS) ? process.env.TRAVIS_BUILD_DIR : process.env.TMPDIR
  if (confDir === undefined) {
    t.fail('no conf directory defined')
    return
  }

  const operatorJwtPath = path.join(confDir, next() + '.jwt')
  writeFileSync(operatorJwtPath, opJWT)

  const creds = `
    -----BEGIN NATS USER JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJFU1VQS1NSNFhGR0pLN0FHUk5ZRjc0STVQNTZHMkFGWERYQ01CUUdHSklKUEVNUVhMSDJBIiwiaWF0IjoxNTQ0MjE3NzU3LCJpc3MiOiJBQ1pTV0JKNFNZSUxLN1FWREVMTzY0VlgzRUZXQjZDWENQTUVCVUtBMzZNSkpRUlBYR0VFUTJXSiIsInN1YiI6IlVBSDQyVUc2UFY1NTJQNVNXTFdUQlAzSDNTNUJIQVZDTzJJRUtFWFVBTkpYUjc1SjYzUlE1V002IiwidHlwZSI6InVzZXIiLCJuYXRzIjp7InB1YiI6e30sInN1YiI6e319fQ.kCR9Erm9zzux4G6M-V2bp7wKMKgnSNqMBACX05nwePRWQa37aO_yObbhcJWFGYjo1Ix-oepOkoyVLxOJeuD8Bw
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUAIBDPBAUTWCWBKIO6XHQNINK5FWJW4OHLXC3HQ2KFE4PEJUA44CNHTC4
------END USER NKEY SEED------
    `

  const testCreds = path.join(confDir, 'credsfile.creds')
  writeFileSync(testCreds, creds)

  const conf = `operator: ${operatorJwtPath}
    resolver: 'MEMORY'
    resolver_preload: {
        ${accountPK}: ${accountJWT}
    }
    `
  // @ts-ignore
  const fp = path.join(confDir, next() + '.conf')
  writeFileSync(fp, conf)

  const server = await nsc.startServer(['-c', fp])
  servers.push(server)

  return new Promise((resolve) => {
    // [begin connect_creds]
    // credentials file contains the JWT and the secret signing key
    const credsFile = path.join(confDir, 'credsfile.creds')

    const nc = NATS.connect({
      url: server.nats,
      credsFile: credsFile
    })
    // [end connect_creds]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})
