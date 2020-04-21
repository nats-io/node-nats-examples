import test from 'ava'
const NATS = require('nats')
const Payload = require('nats').Payload

test('publish_bytes', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    // [begin publish_bytes]
    const nc = NATS.connect({ url: 'nats://demo.nats.io:4222' })
    nc.publish('updates', 'All is Well')
    // [end publish_bytes]
    nc.flush(() => {
      t.pass()
      nc.close()
      resolve()
    })
  })
})

test('publish_json', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    // [begin publish_json]
    const nc = NATS.connect({ url: 'nats://demo.nats.io:4222', payload: Payload.JSON })
    nc.publish('updates', { ticker: 'GOOG', price: 1200 })
    // [end publish_json]
    nc.flush(() => {
      t.pass()
      nc.close()
      resolve()
    })
  })
})

test('publish_with_reply', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    // [begin publish_with_reply]
    const nc = NATS.connect({ url: 'nats://demo.nats.io:4222' })
    // set up a subscription to process the request
    nc.subscribe('time', (_, msg) => {
      if (msg.reply) {
        msg.respond(new Date().toLocaleTimeString())
      }
    })

    // create a subscription subject that the responding send replies to
    const inbox = NATS.createInbox()
    nc.subscribe(inbox, (_, msg) => {
      t.log('the time is', msg.data)
      nc.close()
    }, { max: 1 })

    nc.publishRequest('time', inbox)
    // [end publish_with_reply]
    nc.flush(() => {
      t.pass()
      resolve()
    })
  })
})

test('request_reply', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    // [begin request_reply]
    const nc = NATS.connect({ url: 'nats://demo.nats.io:4222' })

    // set up a subscription to process the request
    nc.subscribe('time', (_, msg) => {
      if (msg.reply) {
        msg.respond(new Date().toLocaleTimeString())
      }
    })

    nc.request('time', (_, msg) => {
      t.log('the time is', msg.data)
      nc.close()
    })
    // [end request_reply]
    nc.flush(() => {
      t.pass()
      resolve()
    })
  })
})

test('flush', (t) => {
  t.plan(1)
  return new Promise((resolve) => {
    // [begin flush]
    const nc = NATS.connect({ url: 'nats://demo.nats.io:4222' })
    const start = Date.now()
    nc.flush(() => {
      t.log('round trip completed in', Date.now() - start, 'ms')
    })

    nc.publish('foo')
    // function in flush is optional
    nc.flush()
    // [end flush]
    nc.flush(() => {
      t.pass()
      resolve()
    })
  })
})

test('wildcard_tester', async (t) => {
  return new Promise((resolve) => {
    const nc = NATS.connect({ url: 'nats://demo.nats.io:4222' })
    nc.subscribe('time.>', (err, msg) => {
      if (err) {
        t.log('error', err)
        t.fail(err)
        return
      }
      // converting timezones correctly in node requires a library
      // this doesn't take into account *many* things.
      let time = ''
      switch (msg.subject) {
        case 'time.us.east':
          time = new Date().toLocaleTimeString('en-us', { timeZone: 'America/New_York' })
          break
        case 'time.us.central':
          time = new Date().toLocaleTimeString('en-us', { timeZone: 'America/Chicago' })
          break
        case 'time.us.mountain':
          time = new Date().toLocaleTimeString('en-us', { timeZone: 'America/Denver' })
          break
        case 'time.us.west':
          time = new Date().toLocaleTimeString('en-us', { timeZone: 'America/Los_Angeles' })
          break
        default:
          time = "I don't know what you are talking about Willis"
      }
      t.log(msg.subject, time)
    })

    // [begin wildcard_tester]
    nc.publish('time.us.east')
    nc.publish('time.us.central')
    nc.publish('time.us.mountain')
    nc.publish('time.us.west')
    // [end wildcard_tester]

    nc.flush(() => {
      nc.close()
      t.pass()
      resolve()
    })
  })
})
