import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Create", t => {
  // WHAT TO TEST
  const todoList = buildList("CREATE_TODOS", {
    create: (data, options, other) => ({
      id: 1,
      ...data,
      options,
      other,
    }),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's action to store's dispatch
  const listCreate = todoList.create(store.dispatch)

  listCreate(
    { name: "New foo" },
    { otherOption: "lorem" },
    { restParam: "ipsum" }
  )
    .then(({ result }) => {
      const selector = todoList.selector(store.getState())

      t.deepEquals(
        selector.creating(),
        [],
        "selector.creating should be empty array"
      )

      t.equals(
        selector.isCreating(),
        false,
        "selector.isCreating should be false after creating"
      )

      t.deepEquals(
        result,
        {
          id: 1,
          name: "New foo",
          options: { isDraft: false, otherOption: "lorem" },
          other: { restParam: "ipsum" },
        },
        "list.create resolves with created item"
      )

      t.deepEquals(
        selector.items(),
        [result],
        "Created element should be added to items array"
      )
    })
    .then(() => listCreate({ id: 2, foo: "bar-draft" }, { isDraft: true }))
    .then(({ result }) => {
      const selector = todoList.selector(store.getState())

      t.deepEquals(
        result,
        {
          id: 2,
          foo: "bar-draft",
        },
        "Draft .create() resolves with item without calling method"
      )

      t.deepEquals(
        selector.items(),
        [
          {
            id: 1,
            name: "New foo",
            options: { isDraft: false, otherOption: "lorem" },
            other: { restParam: "ipsum" },
          },
          result,
        ],
        "Created draft element should be added to items array"
      )

      t.end()
    })
})

test("Create - multiple", t => {
  // WHAT TO TEST
  const todoList = buildList("CREATE-MULTIPLE_TODOS", {
    create: items => items.map((item, index) => ({ id: index, ...item })),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's action to store's dispatch
  const listCreate = todoList.create(store.dispatch)

  listCreate([{ name: "New foo" }, { name: "New foo 2" }]).then(
    ({ result }) => {
      const selector = todoList.selector(store.getState())

      t.deepEquals(
        result,
        [{ id: 0, name: "New foo" }, { id: 1, name: "New foo 2" }],
        "list.create resolves with created items"
      )

      t.deepEquals(
        selector.items(),
        result,
        "Created elements should be added to items array"
      )

      t.end()
    }
  )
})
