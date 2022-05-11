/**
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
  onFulfilledCallback = null;
  // 存储失败回调函数
  onRejectedCallback = null;
  constructor(executor) {
    this.PromiseState = myPromise.PENDING;
    this.PromiseResult = null;
    // 我们是在创建完实例后才执行的resolve函数，这时候的this指向需要注意
    executor(this.resolve, this.reject)
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
      // 判断成功回调是否存在，如果存在就调用
      this.onFulfilledCallback && this.onFulfilledCallback(this.PromiseResult);
    }
  }
  reject = (reason) => {
    if (this.PromiseState === myPromise.PENDING) {
      this.PromiseState = myPromise.REJECTED;
      this.PromiseResult = reason;
      // 判断失败回调是否存在，如果存在就调用
      this.onRejectedCallback && this.onRejectedCallback(this.PromiseResult)
    }
  }
  // then方法里面的两个参数如果不是函数的话就要被忽略
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason;};
    if (this.PromiseState === myPromise.FULFILLED) {
      onFulfilled(this.PromiseResult);
    }
    if (this.PromiseState === myPromise.REJECTED) {
      onRejected(this.PromiseResult);
    }
    if (this.PromiseState === myPromise.PENDING) {
      // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
      // 等到执行成功失败函数的时候再传递
      this.onFulfilledCallback = onFulfilled;
      this.onRejectedCallback = onRejected;
    }
  }
}
const promise = new myPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 2000); 
})

promise.then(value => {
  console.log(1)
  console.log('resolve', value)
})
 
promise.then(value => {
  console.log(2)
  console.log('resolve', value)
})

promise.then(value => {
  console.log(3)
  console.log('resolve', value)
})
