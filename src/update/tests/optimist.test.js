import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from "../.."

test("Update, isOptimist = false", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE-OPTIMIST-FALSE_TODOS",
    read: () => [{ id: 1, foo: "bar" }],
    update: (id, data) => ({ id, ...data }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  await todos.read()

  //
  const updatePromise = todos.update(1, { lorem: "ipsum" })

  t.deepEquals(
    todos.selector(store.getState()).items(),
    [{ id: 1, foo: "bar" }],
    "Item not changed before update promise finished"
  )

  return updatePromise.then(() => {
    t.deepEquals(
      todos.selector(store.getState()).items(),
      [{ id: 1, foo: "bar", lorem: "ipsum" }],
      "Item remains changed after update promise finished"
    )

    t.end()
  })
})

test("Update, isOptimist = true", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE-OPTIMIST-TRUE_TODOS",
    read: () => [{ id: 1, foo: "bar" }],
    update: (id, data) => ({ id, ...data }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  await todos.read()

  //
  const updatePromise = todos.update(
    1,
    { lorem: "ipsum" },
    { isOptimist: true }
  )

  // t.deepEquals(
  //   todos.selector(store.getState()).items(),
  //   [{ id: 1, foo: "bar", lorem: "ipsum" }],
  //   "Item changed before update promise finished"
  // )

  return updatePromise.then(() => {
    t.deepEquals(
      todos.selector(store.getState()).items(),
      [{ id: 1, foo: "bar", lorem: "ipsum" }],
      "Item remains changed after update promise finished"
    )

    t.end()
  })
})

test("Update, isOptimist = true with error", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE-OPTIMIST-TRUE-ERROR_TODOS",
    read: () => [{ id: 1, foo: "bar" }],
    update: () => {
      throw new Error("Some error")
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  await todos.read()

  //
  const updatePromise = todos.update(
    1,
    { lorem: "ipsum" },
    { isOptimist: true }
  )

  // t.deepEquals(
  //   todos.selector(store.getState()).items(),
  //   [{ id: 1, foo: "bar", lorem: "ipsum" }],
  //   "Item changed before update promise finished"
  // )

  return updatePromise.then(() => {
    t.deepEquals(
      todos.selector(store.getState()).items(),
      [{ id: 1, foo: "bar" }],
      "Item reverted to initial value after promised finished with error"
    )

    t.end()
  })
})
