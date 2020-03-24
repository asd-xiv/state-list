import test from "tape"
import { createStore, combineReducers } from "redux"
import { map } from "@mutant-ws/m"

import { buildList, useList } from ".."

test("ReadOne", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "READ-ONE_TODOS",
    read: () => [
      { id: 1, name: "lorem ipsum" },
      { id: 2, name: "foo bar" },
    ],
    readOne: (id, data) => ({
      id,
      ...data,
    }),
    onChange: map(item => ({ ...item, onChange: true })),
  })

  const todos2 = buildList({
    name: "READ-ONE_TODOS-2",
    read: () => [
      { id: 1, name: "lorem ipsum" },
      { id: 2, name: "foo bar" },
    ],
    readOne: (id, data) => ({
      id,
      ...data,
    }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
      [todos2.name]: todos2.reducer,
    })
  )

  {
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
          onChange: true,
        },
        {
          id: 2,
          name: "foo bar",
          onChange: true,
        },
      ],
      "element should be updated in items array"
    )

    t.deepEquals(
      result,
      { id: 1, description: "Extending with more info" },
      "list.readOne resolves with updated item"
    )
  }

  {
    const { selector, readOne } = useList(todos2, store.dispatch)

    await readOne(1, {
      description: "Extending with more info",
    })
    const { items } = selector(store.getState())

    t.deepEquals(
      items(),
      [{ id: 1, description: "Extending with more info" }],
      "readOne returning item that does not exist should add to array"
    )
  }

  t.end()
})
