import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from "../.."

test("Update - id not in response", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE-ERROR-NO-ID_TODOS",
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    update: (id, data) => data,
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  await todos.read()
  await todos.update(1, { name: "updated" })

  const { items } = todos.selector(store.getState())

  t.deepEquals(
    items(),
    [{ id: 1, name: "updated" }, { id: 2 }],
    "Update should be done on the element with the id parameter .update was called with if there is no id field in the response"
  )

  t.end()
})
