/**
 * 是 ES6 提供的一种异步编程解决方案
 * JS在语法层面对协程的支持
 * 普通线程是抢先式的，会争夺cpu资源，而协程是合作的
 * 一个线程上可以存在多个协程，但是在线程上同时只能执行一个协程
 * 协程:主程序和子协程直接控制权的切换
 * 是否真正支持看运行环境（高板本的node）
 * yield，next就是通信接口，next是主协程向子协程通信，而yield就是子协程向主协程通信
 * 执行 Generator 函数会返回一个遍历器对象
 */
/**
 * 1.基本用法
 * yield: 中途暂停点，只有调用next方法才能继续走
 * next方法：会返回一个对象{value: ,done:}
 * value: 就是yield后面接的值, 如果最后的generator函数有返回值，那value就是返回的那个值，没有就是undefined
 * done: 是否generator函数已走完，没走完为false，走完为true
 */
function* gen() {
  yield 1
  yield 2
  yield 3
  return 4
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: 4, done: true }

/**
 * 2. yield后面接函数
 * 接函数的话，到了对应的暂停点yield，就会立即执行函数
 * 如果该函数有返回值，value就是这个值
 */
function fn(num) {
  console.log(num)
  return num
}

function* gen2() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g2 = gen2()
console.log(g2.next())
// 1
// { value: 1, done: false }
console.log(g2.next())
// 2
//  { value: 2, done: false }
console.log(g2.next())
// { value: 3, done: true }

/**
 * 3.yield后面接Promise,value就是promise
 * 可以用then来获取
 */
function fn3(num) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num)
    }, 1000)
  })
}

function* gen3() {
  yield fn3(1)
  yield fn3(2)
  return 3
}
const g3 = gen3()
console.log(g3.next()) // { value: Promise { <pending> }, done: false }
console.log(g3.next()) // { value: Promise { <pending> }, done: false }
console.log(g3.next()) // { value: 3, done: true }
// ---------------------------------------------------------------------------------------------
const next3 = g3.next()
next3.value.then(res3 => {
  console.log(next3) // 1秒后输出 { value: Promise { 1 }, done: false }
  console.log(res3) // 1秒后输出 1
  const next4 = g3.next()
  next4.value.then(res4 => {
    console.log(next4) // 2秒后输出 { value: Promise { 2 }, done: false }
    console.log(res4) // 2秒后输出 2
    console.log(g3.next()) // 2秒后输出 { value: 3, done: true }
  })
})
/**
 * next函数传参
 * 1.第一次next传参是没用的，只有从第二次开始next传参才有用
 * 2.next传值时，要记住顺序是，先右边yield，后左边接收参数
 * 3.next()返回的一定是yeild的值，就算传参，也是yeild返回的值来接收哦
 */
 function* gen5() {
  const num1 = yield 1
  console.log(num1)
  const num2 = yield 2
  console.log(num2)
  return 3
}
const g5 = gen5()
console.log(g5.next()) // { value: 1, done: false }
console.log(g5.next(11111))
// 11111
//  { value: 2, done: false }
console.log(g5.next(22222)) 
// 22222
// { value: 3, done: true }

/**
 * Promise + next 传参
 */
 function fn6(nums) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(nums * 2)
    }, 1000)
  })
}
function* gen6() {
  const num1 = yield fn6(1)
  const num2 = yield fn6(num1)
  const num3 = yield fn6(num2)
  return num3
}
const g6 = gen6()
const next6 = g6.next()
next6.value.then(res6 => {
  console.log(next6) // 1秒后同时输出 { value: Promise { 2 }, done: false }
  console.log(res6) // 1秒后同时输出 2

  const next7 = g6.next(res6) // 传入上次的res1
  next7.value.then(res7 => {
    console.log(next7) // 2秒后同时输出 { value: Promise { 4 }, done: false }
    console.log(res7) // 2秒后同时输出 4

    const next8 = g6.next(res7) // 传入上次的res2
    next8.value.then(res8 => {
      console.log(next8) // 3秒后同时输出 { value: Promise { 8 }, done: false }
      console.log(res8) // 3秒后同时输出 8

       // 传入上次的res3
      console.log(g6.next(res8)) // 3秒后同时输出 { value: 8, done: true }
    })
  })
})
