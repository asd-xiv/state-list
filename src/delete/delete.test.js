import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Delete", t => {
  const todoList = buildList({
    name: "TODOS",
    methods: {
      find: () =>
        Promise.resolve([
          {
            id: 1,
            name: "lorem ipsum",
          },
          {
            id: 2,
            name: "foo bar",
          },
        ]),
      delete: id =>
        Promise.resolve({
          id,
        }),
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's actions to store
  const listFind = todoList.find(store.dispatch)
  const listDelete = todoList.delete(store.dispatch)

  listFind()
    .then(() => listDelete(2))
    .then(id => {
      const state = store.getState()[todoList.name]

      t.equals(id, 2, "list.delete resolves with deleted element id")
      t.equals(state.items.length, 1, "list.delete removed element")
    })
    .then(() => t.end())
    .catch()
})
