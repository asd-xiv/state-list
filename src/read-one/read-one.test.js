import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList, useList } from ".."

test("ReadOne", async t => {
  // WHAT TO TEST
  const todos = buildList("READ-ONE_TODOS", {
    read: () => [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
    readOne: (id, data) => ({
      id,
      ...data,
    }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read, readOne } = useList(todos, store.dispatch)

  await read()

  const { result } = await readOne(1, {
    description: "Extending with more info",
  })
  const { items } = selector(store.getState())

  t.deepEquals(
    result,
    { id: 1, description: "Extending with more info" },
    "list.readOne resolves with updated item"
  )

  t.deepEquals(
    items(),
    [
      {
        id: 1,
        name: "lorem ipsum",
        description: "Extending with more info",
      },
      {
        id: 2,
        name: "foo bar",
      },
    ],
    "element should be updated in items array"
  )

  t.deepEquals(
    result,
    { id: 1, description: "Extending with more info" },
    "list.readOne resolves with updated item"
  )

  t.end()
})
