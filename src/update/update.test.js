import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Update", t => {
  // WHAT TO TEST
  const todoList = buildList({
    name: "UPDATE_TODOS",
    methods: {
      find: () => [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
      update: (id, data) => ({
        id,
        ...data,
      }),
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
    .then(() => listUpdate(2, { name: "Updated foo" }))
    .then(({ result }) => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        result,
        { id: 2, name: "Updated foo" },
        "list.update resolves with updated item"
      )

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "Updated foo" }],
        "element should be updated in items array"
      )

      t.end()
    })
})
