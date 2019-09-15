import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Update", t => {
  // WHAT TO TEST
  const todoList = buildList("UPDATE_TODOS", {
    read: () => [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
    update: (id, data) => ({
      id,
      ...data,
    }),
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
    })
    .then(() => listUpdate(2, { name: "Draft" }, { isDraft: true }))
    .then(({ result }) => {
      t.deepEquals(
        result,
        { id: 2, name: "Draft" },
        "Draft .update() resolves with item without calling method"
      )
      t.end()
    })
})
