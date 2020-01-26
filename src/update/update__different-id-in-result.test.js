import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList, useList } from ".."

test("Update - different id in response", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE-ERROR-DIFFERENT-ID_TODOS",
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    update: () => Promise.resolve({ id: 1, name: "updated different element" }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read, update } = useList(todos, store.dispatch)

  await read()
  await update(2, { name: "random" })

  const { items } = selector(store.getState())

  t.deepEquals(
    items(),
    [{ id: 1, name: "updated different element" }, { id: 2 }],
    "Update should be done on the element with the id returned by .update, not the id that .update was called with"
  )

  t.end()
})
