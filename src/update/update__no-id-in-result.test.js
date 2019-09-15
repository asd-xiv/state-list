import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Update - id not in response", t => {
  // WHAT TO TEST
  const todoList = buildList("UPDATE-ERROR-NO-ID_TODOS", {
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    update: (id, data) => data,
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's action to store's dispatch
  const listRead = todoList.read(store.dispatch)
  const listUpdate = todoList.update(store.dispatch)

  listRead()
    .then(() => listUpdate(1, { name: "updated" }))
    .then(() => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "updated" }, { id: 2 }],
        "Element with id equal to the passed parameter should be updated"
      )

      t.end()
    })
})
