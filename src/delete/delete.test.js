import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Delete", t => {
  // WHAT TO TEST
  const todoList = buildList("DELETE_TODOS", {
    read: () => [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
    delete: (id, testRest) => ({ id, testRest }),
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
    .then(() => listDelete(2, "test-rest-params"))
    .then(({ result }) => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        result,
        { id: 2, testRest: "test-rest-params" },
        "list.delete resolves with element id"
      )

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
