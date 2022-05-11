/**
 * 高阶函数: 参数是函数、返回值也可以是函数
 * 原理: Generator函数和自动执行器，包装在一个函数里
 * async/await作用是用同步方式，执行异步操作
 * 1.如果表达式是 promise 对象, await 返回的是 promise 成功的值
 * 2.如果表达式是其它值, 直接将此值作为 await 的返回值
 * 3.await后面是Promise对象会阻塞后面的代码，Promise 对象 resolve，然后得到 resolve 的值，作为 await 表达式的运算结果
 * 4.所以这就是await必须用在async的原因，async刚好返回一个Promise对象，可以异步执行阻塞
 */
async function fn(args) {
  // ...
}

// 等同于

function fn(args) {
  return spawn(function* () {
    // ...
  });
}

// 接受一个Generator函数作为参数
function spawn(genF) {
  // 返回一个函数
  return function() {
     // 生成指针对象
     const gen = genF.apply(this, arguments);
     // 返回一个promise
     return new Promise((resolve, reject) => {
          // key有next和throw两种取值，分别对应了gen的next和throw方法
          // arg参数则是用来把promise resolve出来的值交给下一个yield
          function step(key, arg) {
            let result;

                // 监控到错误 就把promise给reject掉 外部通过.catch可以获取到错误
                try {
                  result = gen[key](arg)
                } catch (error) {
                  return reject(error)
                }

                // gen.next() 返回 { value, done } 的结构
                const { value, done } = result;

                if (done) {
                      // 如果已经完成了 就直接resolve这个promise
                      return resolve(value)
                } else {
                      // 除了最后结束的时候外，每次调用gen.next()
                      return Promise.resolve(
                        // 这个value对应的是yield后面的promise
                        value
                      ).then((val)=>step("next", val),(err) =>step("throw", err))
                }
          }
          step("next")
     })
  }
}
