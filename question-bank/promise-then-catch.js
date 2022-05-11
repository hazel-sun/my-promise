/**
 * 第六题
 * 做错：我以为直接抛到了catch里面
 * "then: " "Error: error!!!"
 *  返回任意一个非 promise 的值都会被包裹成 promise 对象，因此这里的return new Error('error!!!')也被包裹成了return Promise.resolve(new Error('error!!!'))
 */
Promise.resolve().then(() => {
  return new Error('error!!!')
}).then(res => {
  console.log("then: ", res)
}).catch(err => {
  console.log("catch: ", err)
})

/**
 * 第七题
 * .then 或 .catch 返回的值不能是 promise 本身，否则会造成死循环
 * Uncaught (in promise) TypeError: Chaining cycle detected for promise #<Promise>
 */
const promise7 = Promise.resolve().then(() => {
  return promise7;
})
promise7.catch(console.err)

/**
 * 第八题
 * 做错：完全不知道这个定义
 * .then 或者 .catch 的参数期望是函数，传入非函数则会发生值透传。
 * 第一个then和第二个then中传入的都不是函数，
 * 一个是数字类型，一个是对象类型，
 * 因此发生了透传，将resolve(1) 的值直接传到最后一个then里
 */
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)

/**
 * 第九题
 * 做错：哎，还没理解
 * 'error' 'error!!!'
 * Promise.resolve('1')的值会进入成功的函数，Promise.reject('2')的值会进入失败的函数
 */
Promise.reject('err!!!')
  .then((res) => {
    console.log('success', res)
  }, (err) => {
    console.log('error', err)
  }).catch(err => {
    console.log('catch', err)
  })
// 如果是then里面抛出错误，就会被catch接着
// 它会被后面的catch()给捕获到，而不是被fail1函数捕获
// fail2 Error: error!!!
Promise.resolve()
  .then(function success(res) {
    throw new Error('error!!!')
  }, function fail1(err) {
    console.log('fail1', err)
  }).catch(function fail2(err) {
    console.log('fail2', err)
  })


/**
 * 第十题
 * 1.finally()方法不管Promise对象最后的状态如何都会执行
 * 2.finally()方法的回调函数不接受任何的参数，
 * 也就是说你在.finally()函数中是没法知道Promise最终的状态是resolved还是rejected的
 * 3.它最终返回的默认会是一个上一次的Promise对象值，
 * 不过如果抛出的是一个异常则返回异常的Promise对象。
 */
Promise.resolve('1')
  .then(res => {
    console.log(res)
  })
  .finally(() => {
    console.log('finally')
  })
Promise.resolve('2')
  .finally(() => {
    console.log('finally2')
    return '我是finally2返回的值'
  })
  .then(res => {
    console.log('finally2后面的then函数', res)
  })

/**
 * 第十一题 
 * 难！！！！
 * 你可以理解为链式调用后面的内容需要等前一个调用执行完才会执行
 * 'promise1'
 * '1'
 * 'error'
 * 'finally1'
 * 'finally2'
 * 首先定义了两个函数promise1和promise2，先不管接着往下看。
 * promise1函数先被调用了，然后执行里面new Promise的同步代码打印出promise1
 * 之后遇到了resolve(1)，将p的状态改为了resolved并将结果保存下来。
 * 此时promise1内的函数内容已经执行完了，跳出该函数
 * 碰到了promise1().then()，由于promise1的状态已经发生了改变且为resolved因此将promise1().then()这条微任务加入本轮的微任务列表(这是第一个微任务)
 * 这时候要注意了，代码并不会接着往链式调用的下面走，也就是不会先将.finally加入微任务列表，那是因为.then本身就是一个微任务，它链式后面的内容必须得等当前这个微任务执行完才会执行，因此这里我们先不管.finally()
 * 再往下走碰到了promise2()函数，其中返回的new Promise中并没有同步代码需要执行，所以执行reject('error')的时候将promise2函数中的Promise的状态变为了rejected
 * 跳出promise2函数，遇到了promise2().catch()，将其加入当前的微任务队列(这是第二个微任务)，且链式调用后面的内容得等该任务执行完后才执行，和.then()一样。
 * OK， 本轮的宏任务全部执行完了，来看看微任务列表，存在promise1().then()，执行它，打印出1，然后遇到了.finally()这个微任务将它加入微任务列表(这是第三个微任务)等待执行
 * 再执行promise2().catch()打印出error，执行完后将finally2加入微任务加入微任务列表(这是第四个微任务)
 * OK， 本轮又全部执行完了，但是微任务列表还有两个新的微任务没有执行完，因此依次执行finally1和finally2。
 */
function promise1() {
  let p = new Promise((resolve) => {
    console.log('promise1');
    resolve('1')
  })
  return p;
}

function promise2() {
  return new Promise((resolve, reject) => {
    reject('error')
  })
}
promise1()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('finally1'))

promise2()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('finally2'))












/**
 * 第一题
 * "then: success1"
 * 1.Promise的状态一经改变就不能再改变。
 */
const promise = new Promise((resolve, reject) => {
  resolve("success1");
  reject("error");
  resolve("success2");
});
promise
  .then(res => {
    console.log("then: ", res);
  }).catch(err => {
    console.log("catch: ", err);
  })
/**
 * 第二题
 * "catch: " "error"
 * "then3: " undefined
 * 2.catch不管被连接到哪里，都能捕获上层未捕捉过的错误
 * 3.catch()也会返回一个Promise，且由于这个Promise没有返回值，所以打印出来的是undefined
 */
const promise1 = new Promise((resolve, reject) => {
  reject("error");
  resolve("success2");
});
promise1
  .then(res => {
    console.log("then1: ", res);
  }).then(res => {
    console.log("then2: ", res);
  }).catch(err => {
    console.log("catch: ", err);
  }).then(res => {
    console.log("then3: ", res);
  })
/**
 * 第三题
 * 1 2
 * 每次调用 .then 或者 .catch 都会返回一个新的 promise
 */
Promise.resolve(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    return 3;
  })
  .then(res => {
    console.log(res);
  });
/**
 * 第四题
 * 1 3
 */
Promise.reject(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    console.log(err);
    return 3
  })
  .then(res => {
    console.log(res);
  });
/**
 * 第五题
 * 'timer'
 * 'success' 1001
 * 'success' 1002
 * 你足够快的话，也可能两个都是1001
 * promise 内部状态一经改变，并且有了一个值，那么后续每次调用 .then 或者 .catch 都会直接拿到该值
 */
const promise3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('timer')
    resolve('success')
  }, 1000)
})
const start = Date.now();
promise3.then(res => {
  console.log(res, Date.now() - start)
})
promise3.then(res => {
  console.log(res, Date.now() - start)
})