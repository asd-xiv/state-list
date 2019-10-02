import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList, useList } from ".."

test("Remove - id not in response", async t => {
  // WHAT TO TEST
  const todos = buildList("DELETE-ERROR-NO-ID_TODOS", {
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    remove: () => ({ name: "I dont know who I am :(" }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read, remove } = useList(todos, store.dispatch)

  await read()
  await remove(1)

  const { items } = selector(store.getState())

  t.deepEquals(
    items(),
    [{ id: 2 }],
    "If .remove does not have id field in response, use id from parameter to identify which element to delete"
  )

  t.end()
})
