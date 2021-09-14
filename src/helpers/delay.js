function timeout(ms) {
  let methods;
  let timer;
  const p = new Promise((_resolve, reject) => {
    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    methods = { cancel };
    // @ts-ignore: node is not a number
    timer = setTimeout(() => {
      reject(error_1.NatsError.errorForCode(error_1.ErrorCode.Timeout));
    }, ms);
  });
  // noinspection JSUnusedAssignment
  return Object.assign(p, methods);
}
exports.timeout = timeout;

function deferred() {
  let methods = {};
  const p = new Promise((resolve, reject) => {
    methods = { resolve, reject };
  });
  return Object.assign(p, methods);
}
exports.deferred = deferred;

function delay(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
exports.delay = delay;

exports.check = function check(
  fn,
  timeout = 5000,
  opts = { interval: 50, name: "" },
) {
  opts = Object.assign(opts, { interval: 50 });

  const d = deferred();
  let timer;
  let to;

  to = setTimeout(() => {
    clearTimeout(to);
    clearInterval(timer);
    const m = opts.name ? `${opts.name} timeout` : "timeout";
    return d.reject(new Error(m));
  }, timeout);

  timer = setInterval(async () => {
    try {
      const v = await fn();
      if (v) {
        clearTimeout(to);
        clearInterval(timer);
        return d.resolve(v);
      }
    } catch (_) {
      // ignore
    }
  }, opts.interval);

  return d;
};
