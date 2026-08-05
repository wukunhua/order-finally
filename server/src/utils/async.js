// 把 async 控制器包一层,使抛出的异常能进入 errorHandler
function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { wrap };
