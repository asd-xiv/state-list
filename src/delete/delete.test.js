import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Delete", t => {
  // WHAT TO TEST
  const todoList = buildList({
    name: "DELETE_TODOS",
    methods: {
      find: () => [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
      delete: id => ({
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

  // Link lists's action to store's dispatch
  const listFind = todoList.find(store.dispatch)
  const listDelete = todoList.delete(store.dispatch)

  listFind()
    .then(() => listDelete(2))
    .then(({ result }) => {
      const todosSelector = todoList.selector(store.getState())

      t.equals(result.id, 2, "list.delete resolves with element id")

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "lorem ipsum" }],
        "element should be removed from items array"
      )

      t.equals(
        todosSelector.isDeleting(result.id),
        false,
        "isDeleting by id flag should be false after deleting"
      )

      t.equals(
        todosSelector.isDeleting(),
        false,
        "isDeleting flag should be false after deleting"
      )

      t.end()
    })
})
