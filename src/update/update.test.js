import test from "tape"
import { createStore, combineReducers } from "redux"
import { map, is } from "@mutantlove/m"

import { buildList, useList } from ".."

test("Update", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE_TODOS",
    read: () => [
      { id: 1, name: "lorem ipsum" },
      { id: 2, name: "foo bar" },
    ],
    update: (id, data) => ({
      id,
      ...data,
    }),
    onChange: map(item => ({
      ...item,
      onChange: is(item.onChange) ? item.onChange + 1 : 1,
    })),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read, update } = useList(todos, store.dispatch)

  await read()

  {
    const { result } = await update(2, { name: "Updated foo" })
    const { items } = selector(store.getState())

    t.deepEquals(
      result,
      { id: 2, name: "Updated foo" },
      "list.update resolves with updated item"
    )

    t.deepEquals(
      items(),
      [
        { id: 1, name: "lorem ipsum", onChange: 2 },
        { id: 2, name: "Updated foo", onChange: 2 },
      ],
      "element should be updated in items array"
    )
  }
  {
    const { result } = await update(2, { name: "Draft" }, { isLocal: true })

    t.deepEquals(
      result,
      { id: 2, name: "Draft" },
      "Draft .update() resolves with item without calling method"
    )
  }

  t.end()
})
