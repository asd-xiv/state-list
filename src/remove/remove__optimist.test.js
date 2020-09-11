import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Remove, isOptimist = false", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "REMOVE-OPTIMIST-FALSE_TODOS",
    read: () => [{ id: 1, foo: "bar" }, { id: 2 }],
    remove: id => ({ id }),
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
  const updatePromise = todos.remove(1)

  t.deepEquals(
    todos.selector(store.getState()).items(),
    [{ id: 1, foo: "bar" }, { id: 2 }],
    "Item not deleted before remove promise finished"
  )

  return updatePromise.then(() => {
    t.deepEquals(
      todos.selector(store.getState()).items(),
      [{ id: 2 }],
      "Item deleted after remove promise finished"
    )

    t.end()
  })
})

test("Remove, isOptimist = true", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "REMOVE-OPTIMIST-TRUE_TODOS",
    read: () => [{ id: 1, foo: "bar" }, { id: 2 }],
    remove: id => ({ id }),
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
  const updatePromise = todos.remove(1, { isOptimist: true })

  t.deepEquals(
    todos.selector(store.getState()).items(),
    [{ id: 2 }],
    "Item deleted before remove promise finished"
  )

  return updatePromise.then(() => {
    console.log({
      errors: store.getState()["REMOVE-OPTIMIST-TRUE_TODOS"].errors,
    })

    t.deepEquals(
      todos.selector(store.getState()).items(),
      [{ id: 2 }],
      "Item remains deleted after remove promise finished"
    )

    t.end()
  })
})

test("Remove, isOptimist = true with error", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "REMOVE-OPTIMIST-TRUE-ERROR_TODOS",
    read: () => [{ id: 1, foo: "bar" }, { id: 2 }],
    remove: () => {
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
  const updatePromise = todos.remove(1, { isOptimist: true })

  t.deepEquals(
    todos.selector(store.getState()).items(),
    [{ id: 2 }],
    "Item changed before update promise finished"
  )

  return updatePromise.then(() => {
    t.deepEquals(
      todos.selector(store.getState()).items(),
      [{ id: 2 }, { id: 1, foo: "bar" }],
      "Item reverted to initial value after promised finished with error"
    )

    t.end()
  })
})
