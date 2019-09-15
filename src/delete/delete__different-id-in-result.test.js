import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Delete - different id in response", t => {
  // WHAT TO TEST
  const todoList = buildList("DELETE-ERROR-DIFFERENT-ID_TODOS", {
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    delete: () => Promise.resolve({ id: 1 }),
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
    .then(() => listDelete(2))
    .then(() => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        todosSelector.items(),
        [{ id: 2 }],
        "Element with id equal to the returned value should be removed from items array"
      )

      t.end()
    })
})
