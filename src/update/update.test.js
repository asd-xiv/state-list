import test from "tape"
import { createStore, combineReducers } from "redux"
import { map, concat, is } from "@asd14/m"

import { buildList } from ".."

test("Update", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "UPDATE_TODOS",
    read: () => [
      { id: 1, name: "lorem ipsum" },
      { id: 2, name: "foo bar", items: [{ id: 1, label: "item 1" }] },
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

  todos.set({ dispatch: store.dispatch })

  await todos.read()

  {
    const { result } = await todos.update(2, { name: "Updated foo" })
    const { items } = todos.selector(store.getState())

    t.deepEquals(
      result,
      { id: 2, name: "Updated foo" },
      "list.update resolves with updated item"
    )

    t.deepEquals(
      items(),
      [
        { id: 1, name: "lorem ipsum", onChange: 2 },
        {
          id: 2,
          name: "Updated foo",
          items: [{ id: 1, label: "item 1" }],
          onChange: 2,
        },
      ],
      "element should be updated in items array"
    )
  }

  {
    const { result } = await todos.update(
      2,
      { name: "Draft" },
      { isLocal: true }
    )

    t.deepEquals(
      result,
      { id: 2, name: "Draft" },
      "Draft .update() resolves with item without calling method"
    )
  }

  {
    await todos.update(
      2,
      { name: "Updated foo", items: [{ id: 2 }] },
      {
        onMerge: (
          { items: aItems = [], ...aRest },
          { items: bItems = [], ...bRest }
        ) => {
          return {
            ...aRest,
            ...bRest,
            items: concat(aItems)(bItems),
          }
        },
      }
    )
    const { items } = todos.selector(store.getState())

    t.deepEquals(
      items(),
      [
        { id: 1, name: "lorem ipsum", onChange: 4 },
        {
          id: 2,
          name: "Updated foo",
          items: [{ id: 2 }, { id: 1, label: "item 1" }],
          onChange: 4,
        },
      ],
      "element should be updated in items array via custom onMerge function"
    )
  }

  t.end()
})
