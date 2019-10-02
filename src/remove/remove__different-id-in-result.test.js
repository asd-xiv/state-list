import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList, useList } from ".."

test("Remove - different id in response", async t => {
  // WHAT TO TEST
  const todos = buildList("DELETE-ERROR-DIFFERENT-ID_TODOS", {
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    remove: () => Promise.resolve({ id: 1 }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read, remove } = useList(todos, store.dispatch)

  await read()
  await remove(2)

  const { items } = selector(store.getState())

  t.deepEquals(
    items(),
    [{ id: 2 }],
    "Element with id equal to the returned value should be removed from items array"
  )

  t.end()
})
