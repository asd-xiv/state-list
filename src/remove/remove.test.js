import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList, useList } from ".."

test("Remove", async t => {
  // WHAT TO TEST
  const todos = buildList("DELETE_TODOS", {
    read: () => [
      { id: 1, name: "lorem ipsum" },
      { id: 2, name: "foo bar" },
    ],
    remove: (id, testRest) => ({ id, testRest }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read, remove } = useList(todos, store.dispatch)

  await read()

  const { result } = await remove(2, "test-rest-params")
  const { items, isRemoving } = selector(store.getState())

  t.deepEquals(
    result,
    { id: 2, testRest: "test-rest-params" },
    "list.remove resolves with element id"
  )

  t.deepEquals(
    items(),
    [{ id: 1, name: "lorem ipsum" }],
    "element should be removed from items array"
  )

  t.equals(
    isRemoving(result.id),
    false,
    "isRemoving by id flag should be false after deleting"
  )

  t.equals(
    isRemoving(),
    false,
    "isRemoving flag should be false after deleting"
  )

  t.end()
})
