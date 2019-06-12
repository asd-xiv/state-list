import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Update - different id in response", t => {
  // WHAT TO TEST
  const todoList = buildList({
    name: "UPDATE-ERROR-DIFFERENT-ID_TODOS",
    methods: {
      find: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
      update: () =>
        Promise.resolve({ id: 1, name: "updated different element" }),
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's action to store's dispatch
  const listFind = todoList.find(store.dispatch)
  const listUpdate = todoList.update(store.dispatch)

  listFind()
    .then(() => listUpdate(2, { name: "random" }))
    .then(() => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "updated different element" }, { id: 2 }],
        "Element with id equal to the returned value should be removed from items array"
      )

      t.end()
    })
})