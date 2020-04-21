import test from 'ava'
const NATS = require('nats')

test('reconnect_no_random', async (t) => {
  return new Promise((resolve) => {
    // [begin reconnect_no_random]
    const nc = NATS.connect({
      noRandomize: false,
      servers: ['nats://127.0.0.1:4443',
        'nats://demo.nats.io:4222'
      ]
    })
    // [end reconnect_no_random]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('reconnect_none', async (t) => {
  return new Promise((resolve) => {
    // [begin reconnect_none]
    const nc = NATS.connect({
      reconnect: false,
      servers: ['nats://demo.nats.io:4222']
    })
    // [end reconnect_none]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('reconnect_10s', async (t) => {
  return new Promise((resolve) => {
    // [begin reconnect_10s]
    const nc = NATS.connect({
      reconnectTimeWait: 10 * 1000, // 10s
      servers: ['nats://demo.nats.io:4222']
    })
    // [end reconnect_10s]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('reconnect_10x', async (t) => {
  return new Promise((resolve) => {
    // [begin reconnect_10x]
    const nc = NATS.connect({
      maxReconnectAttempts: 10,
      servers: ['nats://demo.nats.io:4222']
    })
    // [end reconnect_10x]
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('reconnect_event', async (t) => {
  return new Promise((resolve) => {
    // [begin reconnect_event]
    const nc = NATS.connect({
      maxReconnectAttempts: 10,
      servers: ['nats://demo.nats.io:4222']
    })

    nc.on('reconnect', () => {
      console.log('reconnected')
    })
    // [end reconnect_event]
    t.pass()
    nc.on('connect', () => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})

test('reconnect_5mb', (t) => {
  // [begin reconnect_5mb]
  // Reconnect buffer size is not configurable on node-nats
  // [end reconnect_5mb]
  t.pass()
})
