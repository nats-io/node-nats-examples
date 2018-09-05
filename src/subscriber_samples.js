import test from "ava";
let NATS = require('nats');

test('subscribe_async', (t) => {
    return new Promise((resolve, reject) => {
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222"
        });
        // [begin subscribe_async]
        nc.subscribe("updates", (msg) => {
            t.log(msg);
        });
        // [end subscribe_async]
        nc.publish("updates", "All is Well!", ()=> {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('subscribe_w_reply', async(t) => {
    return new Promise((resolve, reject) => {
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222"
        });

        // [begin subscribe_w_reply]
        // set up a subscription to process a request
        nc.subscribe('time', (msg, reply) => {
            if (msg.reply) {
                nc.publish(msg.reply, new Date().toLocaleTimeString());
            }
        });
        // [end subscribe_w_reply]
        nc.requestOne('time', (msg) => {
            t.log('the time is', msg);
        });

        nc.flush(() => {
            nc.close();
            t.pass();
            resolve();
        });
    })
});

test('unsubscribe', (t) => {
    return new Promise((resolve, reject) => {
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222"
        });

        // [begin unsubscribe]
        // set up a subscription to process a request
        let sub = nc.subscribe(NATS.createInbox(), (msg, reply) => {
            if (msg.reply) {
                nc.publish(reply, new Date().toLocaleTimeString());
            }
        });

        // without arguments the subscription will cancel when the server receives it
        // you can also specify how many messages are expected by the subscription
        nc.unsubscribe(sub);
        // [end unsubscribe]
        nc.flush(() => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('subscribe_json', (t) => {
    return new Promise((resolve, reject) => {
        // [begin subscribe_json]
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222",
            json: true
        });

        nc.subscribe('updates', (msg) => {
            if(msg && msg.ticker === 'TSLA') {
                t.log('got message:', msg);
            }
        });

        // [end subscribe_json]
        nc.publish('updates', {ticker: 'TSLA', price: 355.49});
        nc.flush(() => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});


test('unsubscribe_auto', (t) => {
    return new Promise((resolve, reject) => {
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222"
        });

        // [begin unsubscribe_auto]
        // `max` specifies the number of messages that the server will forward.
        // The server will auto-cancel.
        let opts = {max: 10};
        let sub = nc.subscribe(NATS.createInbox(), opts, (msg) => {
            t.log(msg);
        });

        // another way after 10 messages
        let sub2 = nc.subscribe(NATS.createInbox(), (err, msg) => {
            t.log(msg.data);
        });
        // if the subscription already received 10 messages, the handler
        // won't get any more messages
        nc.unsubscribe(sub2, 10);
        // [end unsubscribe_auto]
        nc.flush(() => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('subscribe_star', (t) => {
    return new Promise((resolve, reject) => {
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222"});

        // [begin subscribe_star]
        nc.subscribe('time.us.*', (msg, reply, subject) => {
            // converting timezones correctly in node requires a library
            // this doesn't take into account *many* things.
            let time = "";
            switch (subject) {
                case 'time.us.east':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/New_York"});
                    break;
                case 'time.us.central':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Chicago"});
                    break;
                case 'time.us.mountain':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Denver"});
                    break;
                case 'time.us.west':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Los_Angeles"});
                    break;
                default:
                    time = "I don't know what you are talking about Willis";
            }
            t.log(subject, time);
        });
        // [end subscribe_star]
        nc.publish('time.us.east');
        nc.publish('time.us.central');
        nc.publish('time.us.mountain');
        nc.publish('time.us.west');
        nc.flush(()=> {
            nc.close();
            t.pass();
            resolve();
        });
    });
});


test('subscribe_arrow', async(t) => {
    return new Promise((resolve, reject) => {
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222"});

        // [begin subscribe_arrow]
        nc.subscribe('time.>', (msg, reply, subject) => {
            // converting timezones correctly in node requires a library
            // this doesn't take into account *many* things.
            let time = "";
            switch (subject) {
                case 'time.us.east':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/New_York"});
                    break;
                case 'time.us.central':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Chicago"});
                    break;
                case 'time.us.mountain':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Denver"});
                    break;
                case 'time.us.west':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Los_Angeles"});
                    break;
                default:
                    time = "I don't know what you are talking about Willis";
            }
            t.log(subject, time);
        });
        // [end subscribe_arrow]
        nc.publish('time.us.east');
        nc.publish('time.us.central');
        nc.publish('time.us.mountain');
        nc.publish('time.us.west');
        nc.flush(() => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('subscribe_queue', (t) => {
    return new Promise((resolve, reject) => {
        let nc = NATS.connect({
            url: "nats://demo.nats.io:4222"});

        // [begin subscribe_queue]
        nc.subscribe('updates', {queue: "workers"}, (msg) => {
            t.log('worker got message', msg);
        });
        // [end subscribe_queue]
        nc.publish('updates');
        nc.flush(() => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});

test('drain_sub', (t) => {
    // [begin drain_sub]
    // Drain subscription is not supported.
    // [end drain_sub]
    t.pass();
});

test('no_echo', (t) => {
    // [begin no_echo]
    // no_echo is not supported.
    // [end no_echo]
    t.pass();
});