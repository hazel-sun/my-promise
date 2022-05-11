/**
 * 第一题
 * start、end、resolve、time
 */
console.log('start')
setTimeout(() => {
  console.log('time')
})
Promise.resolve().then(() => {
  console.log('resolve')
})
console.log('end')

/**
 * 第二题
 * 1,2,4,timerStart,timerEnd,success
 */
const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);
  console.log(2);
});
promise.then((res) => {
  console.log(res);
});
console.log(4);
/**
 * 第三题
 * start，timer1，timer2，timer3
 */
setTimeout(() => {
  console.log('timer1');
  setTimeout(() => {
    console.log('timer3')
  }, 0)
}, 0)
setTimeout(() => {
  console.log('timer2')
}, 0)
console.log('start')
//----------------------------------------
// start,timer1,promise,timer2
setTimeout(() => {
  console.log('timer1');
  Promise.resolve().then(() => {
    console.log('promise')
  })
}, 0)
setTimeout(() => {
  console.log('timer2')
}, 0)
console.log('start')

/**
 * 第四题
 * 就算把定时器存到了变量里，也会直接执行
 * start、promise1、timer1、promise2、timer2
 */
Promise.resolve().then(() => {
  console.log('promise1');
  const timer2 = setTimeout(() => {
    console.log('timer2')
  }, 0)
});
const timer1 = setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(() => {
    console.log('promise2')
  })
}, 0)
console.log('start');

/**
 * 第五题
 * 'promise1' Promise{<pending>}
 * 'promise2' Promise{<pending>}
 *  test5.html:102 Uncaught (in promise) Error: error!!! at test.html:102
 * 'promise1' Promise{<resolved>: "success"}
 * 'promise2' Promise{<rejected>: Error: error!!!}
 * 1.从上至下，先执行第一个new Promise中的函数，碰到setTimeout将它加入下一个宏任务列表
 * 2.跳出new Promise，碰到promise1.then这个微任务，但其状态还是为pending，这里理解为先不执行
 * 3.promise2是一个新的状态为pending的Promise
 * 4.执行同步代码console.log('promise1')，且打印出的promise1的状态为pending
 * 5.执行同步代码console.log('promise2')，且打印出的promise2的状态为pending
 * 6.碰到第二个定时器，将其放入下一个宏任务列表
 * 7.第一轮宏任务执行结束，并且没有微任务需要执行，因此执行第二轮宏任务
 * 8.先执行第一个定时器里的内容，将promise1的状态改为resolved且保存结果并将之前的promise1.then推入微任务队列
 * 8.该定时器中没有其它的同步代码可执行，因此执行本轮的微任务队列，也就是promise1.then，它抛出了一个错误，且将promise2的状态设置为了rejected
 * 10.第一个定时器执行完毕，开始执行第二个定时器中的内容
 * 11.打印出'promise1'，且此时promise1的状态为resolved
 * 12.打印出'promise2'，且此时promise2的状态为rejected
 */
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
const promise2 = promise1.then(() => {
  throw new Error('error!!!')
})
console.log('promise1', promise1)
console.log('promise2', promise2)
setTimeout(() => {
  console.log('promise1', promise1)
  console.log('promise2', promise2)
}, 2000)

/**
 * 第六题
 * promise1里的内容
 * 'promise1' Promise{<pending>}
 * 'promise2' Promise{<pending>}
 * timer1
 * test5.html:102 Uncaught (in promise) Error: error!!! at test.html:102
 * 'timer2'
 * 'promise1' Promise{<resolved>: "success"}
 * 'promise2' Promise{<rejected>: Error: error!!!}
 */
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("success");
    console.log("timer1");
  }, 1000);
  console.log("promise1里的内容");
});
const promise2 = promise1.then(() => {
  throw new Error("error!!!");
});
console.log("promise1", promise1);
console.log("promise2", promise2);
setTimeout(() => {
  console.log("timer2");
  console.log("promise1", promise1);
  console.log("promise2", promise2);
}, 2000);