import test from "tape"
import { createStore, combineReducers } from "redux"
import { map } from "@mutantlove/m"

import { buildList, useList } from ".."

test("Create", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "CREATE_TODOS",
    create: (data, options, other) => ({
      id: 1,
      ...data,
      options,
      other,
    }),
    onChange: map((item, index, array) => ({
      ...item,
      onChange: array.length,
    })),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  {
    const { selector, create } = useList(todos, store.dispatch)
    const { result } = await create(
      { name: "New foo" },
      { otherOption: "lorem" },
      { restParam: "ipsum" }
    )
    const { creating, items, isCreating } = selector(store.getState())

    t.deepEquals(creating(), [], "selector.creating should be empty array")

    t.equals(
      isCreating(),
      false,
      "selector.isCreating should be false after creating"
    )

    t.deepEquals(
      result,
      {
        id: 1,
        name: "New foo",
        options: { isLocal: false, otherOption: "lorem" },
        other: { restParam: "ipsum" },
      },
      "list.create resolves with created item"
    )

    t.deepEquals(
      items(),
      [
        {
          id: 1,
          name: "New foo",
          options: { isLocal: false, otherOption: "lorem" },
          other: { restParam: "ipsum" },
          onChange: 1,
        },
      ],
      "Created element should be added to items array"
    )
  }
  {
    const { selector, create } = useList(todos, store.dispatch)
    const { result } = await create(
      { id: 2, foo: "bar-draft" },
      { isLocal: true }
    )
    const { items } = selector(store.getState())

    t.deepEquals(
      result,
      {
        id: 2,
        foo: "bar-draft",
      },
      "Draft .create() resolves with item without calling method"
    )

    t.deepEquals(
      items(),
      [
        {
          id: 1,
          name: "New foo",
          options: { isLocal: false, otherOption: "lorem" },
          other: { restParam: "ipsum" },
          onChange: 2,
        },
        {
          id: 2,
          foo: "bar-draft",
          onChange: 2,
        },
      ],
      "Created draft element should be added to items array"
    )
  }

  t.end()
})

test("Create - multiple", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "CREATE-MULTIPLE_TODOS",
    create: items => items.map((item, index) => ({ id: index, ...item })),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, create } = useList(todos, store.dispatch)
  const { result } = await create([{ name: "New foo" }, { name: "New foo 2" }])
  const { items } = selector(store.getState())

  t.deepEquals(
    result,
    [
      { id: 0, name: "New foo" },
      { id: 1, name: "New foo 2" },
    ],
    "list.create resolves with created items"
  )

  t.deepEquals(
    items(),
    result,
    "Created elements should be added to items array"
  )

  t.end()
})
