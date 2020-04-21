import test from 'ava'
import { join } from 'path'
const fs = require('fs')
const NATS = require('nats')
const nsc = require('./_nats_server_control')

const serverCertPath = join(__dirname, '../certs/server.pem')
const serverKeyPath = join(__dirname, '../certs/key.pem')
const caCertPath = join(__dirname, '../certs/ca.pem')
const clientCertPath = join(__dirname, '../certs/client-cert.pem')
const clientKeyPath = join(__dirname, '../certs/client-key.pem')

test.before(async (t) => {
  t.log(__dirname)

  const server = await nsc.startServer(['--tlsverify', '--tlscert', serverCertPath, '--tlskey', serverKeyPath, '--tlscacert', caCertPath])
  t.context = { server: server }
})

test.after.always((t) => {
  nsc.stopServer(t.context.server)
})

test('connect_tls_url', (t) => {
  return new Promise((resolve) => {
    // [begin connect_tls_url]
    const nc = NATS.connect({
      url: 'tls://demo.nats.io:4443',
      tls: true
    })
    // [end connect_tls_url]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('connect_tls', (t) => {
  return new Promise((resolve) => {
    const url = t.context.server.nats
    // [begin connect_tls]
    const caCert = fs.readFileSync(caCertPath)
    const clientCert = fs.readFileSync(clientCertPath)
    const clientKey = fs.readFileSync(clientKeyPath)
    const nc = NATS.connect({
      url: url,
      tls: {
        ca: [caCert],
        key: [clientKey],
        cert: [clientCert]
      }
    })
    // [end connect_tls]
    nc.flush(() => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})
