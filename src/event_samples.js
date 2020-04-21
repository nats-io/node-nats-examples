import test from 'ava'
const NATS = require('nats')

test('connection_listener', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    function doSomething () {
      t.pass()
      resolve()
    }
    // [begin connection_listener]
    const nc = NATS.connect('nats://demo.nats.io:4222')

    nc.on('error', (err) => {
      t.log('error', err)
    })

    nc.on('connect', () => {
      t.log('client connected')
    })

    nc.on('disconnect', () => {
      t.log('client disconnected')
    })

    nc.on('reconnecting', () => {
      t.log('client reconnecting')
    })

    nc.on('reconnect', () => {
      t.log('client reconnected')
    })

    nc.on('close', () => {
      t.log('client closed')
    })

    nc.on('permission_error', (err) => {
      t.log('permission_error', err)
    })
    // [end connection_listener]

    nc.flush(() => {
      doSomething()
    })
  })
})

test('servers_added', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    function doSomething () {
      t.pass()
      resolve()
    }
    // [begin servers_added]
    const nc = NATS.connect('nats://demo.nats.io:4222')
    nc.on('serversDiscovered', (urls) => {
      t.log('serversDiscovered', urls)
    })
    // [end servers_added]

    nc.flush(() => {
      doSomething()
    })
  })
})

test('error_listener', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    function doSomething () {
      t.pass()
      resolve()
    }
    // [begin error_listener]
    const nc = NATS.connect('nats://demo.nats.io:4222')

    // on node you *must* register an error listener. If not registered
    // the library emits an 'error' event, the node process will exit.
    nc.on('error', (err) => {
      t.log('client got an error:', err)
    })
    // [end error_listener]

    nc.flush(() => {
      doSomething()
    })
  })
})

test('connect_status', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    function doSomething () {
      t.pass()
      resolve()
    }
    // [begin connect_status]
    const nc = NATS.connect('nats://demo.nats.io:4222')

    // on node you *must* register an error listener. If not registered
    // the library emits an 'error' event, the node process will exit.
    nc.on('error', (err) => {
      t.log('client got an error:', err)
    })

    if (nc.closed) {
      t.log('client is closed')
    } else {
      t.log('client is not closed')
    }
    // [end connect_status]

    nc.flush(() => {
      doSomething()
    })
  })
})

test('max_payload', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    function doSomething () {
      t.pass()
      resolve()
    }
    // [begin max_payload]
    const nc = NATS.connect('nats://demo.nats.io:4222')

    // on node you *must* register an error listener. If not registered
    // the library emits an 'error' event, the node process will exit.
    nc.on('error', (err) => {
      t.log('client got an error:', err)
    })
    nc.on('connect', () => {
      t.log('max_payload', nc.info.max_payload)
    })
    // [end max_payload]
    nc.flush(() => {
      doSomething()
    })
  })
})
