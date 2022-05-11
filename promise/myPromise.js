/**
 * https://juejin.cn/post/7043758954496655397#heading-5
 * Promise对象代表一个异步操作
 * 1.Promise 是一个类，在执行这个类的时候会传入一个执行器executor，这个执行器会立即执行
 * 2.Promise有三种状态pending（进行中）、fulfilled（已成功）和rejected（已失败）
 * 3.执行resolve()、reject()以及throw,执行后就会改变状态，throw(相当于执行了reject。这就要使用try catch了)
 * 4.pending状态下不会调用then()函数
 * 5.一般来说，不要在then()方法里面定义 Reject 状态的回调函数（即then的第二个参数），总是使用catch方法
 * @param executor 规定必须给Promise对象传入一个执行函数，否则将会报错。
 */
// 异步版残留问题
// promise的then方法是可以被调用多次的，如果有三个then调用,而且都是同步回调，那直接返回当前的值就行
// 如果是异步回调，保存的成功失败的回调需要不同的值保存
// 
class myPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';
  // 存储成功回调函数
  onFulfilledCallbacks = [];
  // 存储失败回调函数
  onRejectedCallbacks = [];
  constructor(executor) {
    this.PromiseState = myPromise.PENDING;
    this.PromiseResult = null;
    // 我们是在创建完实例后才执行的resolve函数，这时候的this指向需要注意
    try {
      executor(this.resolve, this.reject)
    } catch (error) {
      this.reject(error) // 报错就是直接执行了，不用关心this指向
    }
  }
  // 为什么resolve、reject要使用箭头函数?
  // 如果直接调用的话，普通函数this指向的是window或者undefined
  // 用箭头函数就可以让this指向当前实例对象
  // 更改成功后的状态
  resolve = (result) => {
    // 只有状态是等待，才执行状态修改
    if (this.PromiseState === myPromise.PENDING) {
      this.PromiseState = myPromise.FULFILLED;
      this.PromiseResult = result;
      // resolve里面将所有成功的回调拿出来执行
      while (this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()(this.PromiseResult)
      }
    }
  }
  reject = (reason) => {
    if (this.PromiseState === myPromise.PENDING) {
      this.PromiseState = myPromise.REJECTED;
      this.PromiseResult = reason;
      // resolve里面将所有失败的回调拿出来执行
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(reason)
      }
    }
  }
  /**
   * thenable 的特性使得 Promise 的实现更具有通用性：只要其暴露出一个遵循 Promises/A+ 协议的 then 方法即可；这同时也使遵循 Promises/A+ 规范的实现可以与那些不太规范但可用的实现能良好共存
   * then方法本身会返回一个新的Promise对象
   * x(onFulfilled 或者 onRejected 返回一个值 x)
   * 1.普通值
   * 2.Promise对象(x和当前promise指向同一对象，拒绝执行)
   * 3.thenable对象/函数
   * @param {*} onFulfilled 
   * @param {*} onRejected 
   * @returns 
   */
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {
      throw reason;
    };
    // 为了链式调用这里直接创建一个 MyPromise，并在后面 return 出去
    // 如果onFulfilled 或者 onRejected 抛出一个异常 e，promise2必须拒绝执行，并返回拒绝原因e
    const promise2 = new myPromise((resolve, reject) => {
      if (this.PromiseState === myPromise.FULFILLED) {
        try {
          // 获取成功回调函数的执行结果
          const x = onFulfilled(this.PromiseResult);
          // 传入 resolvePromise 集中处理
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error); // 捕获前面onFulfilled中抛出的异常
        }

      }
      if (this.PromiseState === myPromise.REJECTED) {
        try {
          const x = onRejected(this.PromiseResult);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error); // 捕获前面onRejected中抛出的异常
        }
      }
      if (this.PromiseState === myPromise.PENDING) {
        // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
        // 等到执行成功失败函数的时候再传递
        // 我们在 pending 状态保存的 resolve() 和 reject() 回调也要符合 
        // 如果onFulfilled 或者 onRejected 抛出一个异常 e，promise2必须拒绝执行，并返回拒绝原因e
        this.onFulfilledCallbacks.push(() => {
          try {
            // 获取成功回调函数的执行结果
            const x = onFulfilled(this.PromiseResult);
            // 传入 resolvePromise 集中处理
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });


        this.onRejectedCallbacks.push(onRejected);
      }
    })
    return promise2;
  }
  /**
   * 我们显式使用catch,内部调用的还是obj.then(undefined, onRejected))
   * 一般来说，我们不要在then()方法里面定义reject的回调函数处理异常,总是使用catch方法
   * 理由: 可以捕获前面then方法执行中的错误，也更接近同步的写法
   */
  catch () {

  }
  static resolve(value) {
    // 如果这个值是一个 promise ，那么将返回这个 promise 
    if (value instanceof myPromise) {
      return value;
    } else if (value instanceof Object && 'then' in value) {
      // 如果这个值是thenable（即带有`"then" `方法），返回的promise会“跟随”这个thenable的对象，采用它的最终状态；
      return new myPromise((resolve, reject) => {
        value.then(resolve, reject);
      })
    }

    // 否则返回的promise将以此值完成，即以此值执行`resolve()`方法 (状态为fulfilled)
    return new myPromise((resolve) => {
      resolve(value)
    })
  }
  static reject(reason) {
    return new myPromise((resolve, reject) => {
      reject(reason);
    })
  }
}
/**
 * 
 * @param  {promise} promise2 promise1.then方法返回的新的promise对象
 * @param  {[type]} x         promise1中onFulfilled或onRejected的返回的值
 * @param  {[type]} resolve   promise2的resolve方法
 * @param  {[type]} reject    promise2的reject方法
 * 1.如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
 * 2.如果 x 为 Promise ，则使 promise 接受 x 的状态
 * 3.如果 x 为 对象或者函数。以 x 为参数执行 promise
 * 4.如果 x 不为对象或者函数,以 x 为参数执行 promise
 */

// 不论promise1被resolve还是reject，promise2都会执行解决过程
function resolvePromise(promise2, x, resolve, reject) {
  // 1.如果相等了，说明return的是自己，会导致循环引用报错
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  // 2.如果 x 为 Promise ，则使 promise 接受 x 的状态
  if (x instanceof myPromise) {
    if (x.PromiseState === myPromise.PENDING) {
      /**
       * 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
       * 注意"直至 x 被执行或拒绝"这句话，
       * 这句话的意思是：x 被执行x，如果执行的时候拿到一个y，还要继续解析y
       */
      x.then(y => {
        resolvePromise(promise2, y, resolve, reject)
      }, reject);
    } else if (x.PromiseState === myPromise.FULFILLED) {
      // 如果 x 处于执行态，用相同的值执行 promise
      resolve(x.PromiseResult);
    } else if (x.PromiseState === myPromise.REJECTED) {
      // 如果 x 处于拒绝态，用相同的据因拒绝 promise
      reject(x.PromiseResult);
    }
  }
  // 3.如果 x 为对象或者函数,以 x 为参数执行 promise
  if (x != null && ((typeof x === 'object' || (typeof x === 'function')))) {
    try {
      let then = x.then;
    } catch (e) {
      // 2.3.3.2 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(e);
    }
    /**
     * 2.3.3.3 
     * 如果 then 是函数，将 x 作为函数的作用域 this 调用之。
     * 传递两个回调函数作为参数，
     * 第一个参数叫做 `resolvePromise` ，第二个参数叫做 `rejectPromise`
     */
    if (typeof then === 'function') {
      // 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      let called = false; // 避免多次调用
      try {
        then.call(
          x,
          // 2.3.3.3.1 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          // 2.3.3.3.2 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        )
      } catch (e) {
        /**
         * 2.3.3.3.4 如果调用 then 方法抛出了异常 e
         * 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
         */
        if (called) return;
        called = true;

        /**
         * 2.3.3.3.4.2 否则以 e 为据因拒绝 promise
         */
        reject(e);
      }
    } else {
      // 2.3.3.4 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  }
}
myPromise.deferred = function () {
  let result = {};
  result.promise = new myPromise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });
  return result;
}
module.exports = myPromise;