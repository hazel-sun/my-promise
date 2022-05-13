/**
 * 第九题
 * test start...
 * 执行testSometing
 * promise start...
 * test end...
 * testSometing
 * 执行testAsync
 * promise
 * hello async
 * 'testSometing' 'hello async'
 */
 async function testSometing() {
  console.log("执行testSometing");
  return "testSometing";
}

async function testAsync() {
  console.log("执行testAsync");
  return Promise.resolve("hello async");
}

async function test() {
  console.log("test start...");
  const v1 = await testSometing();
  console.log(v1);
  const v2 = await testAsync();
  console.log(v2);
  console.log(v1, v2);
}

test();

var promise = new Promise(resolve => {
  console.log("promise start...");
  resolve("promise");
});
promise.then(val => console.log(val));

console.log("test end...");
/**
 * 第五题
 * 写错：
 * 1.srcipt start
 * 2.async1()函数调用，打印'async1 start'
 * 3.然后遇见await 打印'promise1'
 * 4.但是这个await后面的Promise并没有resolve，状态始终就是pending状态，就是一直在await，await却始终没有响应，
 * 5.包括后面async1后面的 .then也不会执行
 * 6.srcipt end
 */
async function async1() {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => console.log(res))
console.log('srcipt end')


/**
 * 第一题
 * async1 start
 * async2
 * start
 * async1 end
 * 1.执行async1函数，打印"async1 start"
 * 2.遇到await，先去执行async2()，打印"async2"
 * 3.跳出async1函数，然后执行同步代码，打印 start
 * 4.在一轮宏任务全部执行完之后，再来执行async1后面的内容
 * （可以理解把await下面的语句都包含在了promise中了）
 */
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
async1();
console.log('start')

/**
 * 第二题
 * async1 start
 * async2
 * start
 * async1 end
 * timer
 */
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  setTimeout(() => {
    console.log('timer')
  }, 0)
  console.log("async2");
}
async1();
console.log("start")
/**
 * 第三题
 * async1 start
 * async2
 * start
 * async1 end
 * timer2
 * timer3
 * timer1
 */
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log('timer1')
  }, 0)
}
async function async2() {
  setTimeout(() => {
    console.log('timer2')
  }, 0)
  console.log("async2");
}
async1();
setTimeout(() => {
  console.log('timer3')
}, 0)
console.log("start")
/**
 * 第四题
 * 正常情况下，async中的await命令是一个Promise对象，返回该对象的结果。
 * 但如果不是Promise对象的话，就会直接返回对应的值，相当于Promise.resolve()
 * 124
 */
async function fn() {
  // return await 1234
  // 等同于
  return 123
}
fn().then(res => console.log(res))


/**
 * 第六题
 * srcipt start
 * async1 start
 * promise1
 * srcipt end'
 * promise1 resolve
 * async1 success
 * async1 end
 */
async function async1() {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
    resolve('promise1 resolve')
  }).then(res => console.log(res))
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => console.log(res))
console.log('srcipt end')

/**
 * 第七题
 * srcipt start
 * async1 start
 * promise1
 * promise2
 * async1 success
 * async1 end
 * timer
 */
async function async1() {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
    resolve('promise resolve')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => {
  console.log(res)
})
new Promise(resolve => {
  console.log('promise2')
  setTimeout(() => {
    console.log('timer')
  })
})
/**
 * 第八题
 * script start
 * async1 start
 * async2
 * promise1
 * script end
 * async1 end
 * promise2
 * setTimeout
 */
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function () {
  console.log("setTimeout");
}, 0);

async1();

new Promise(function (resolve) {
  console.log("promise1");
  resolve();
}).then(function () {
  console.log("promise2");
});
console.log('script end')
