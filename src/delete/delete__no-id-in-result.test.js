import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Delete - id not in response", t => {
  // WHAT TO TEST
  const todoList = buildList("DELETE-ERROR-NO-ID_TODOS", {
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    delete: () => ({ name: "I dont know who I am :(" }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's action to store's dispatch
  const listFind = todoList.read(store.dispatch)
  const listDelete = todoList.delete(store.dispatch)

  listFind()
    .then(() => listDelete(1))
    .then(() => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        todosSelector.items(),
        [{ id: 2 }],
        "Element with id equal to the passed parameter should be removed from items array"
      )

      t.end()
    })
})
