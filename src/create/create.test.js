import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildCollection } from ".."

test("Create", t => {
  // WHAT TO TEST
  const todoList = buildCollection({
    name: "CREATE_TODOS",
    methods: {
      find: () => [],
      create: data => ({
        id: 1,
        ...data,
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
  const listCreate = todoList.create(store.dispatch)
  const listFind = todoList.find(store.dispatch)

  // eslint-disable-next-line promise/catch-or-return
  listFind()
    .then(() => listCreate({ name: "New foo" }))
    // .then(() => {
    //   // Trigger create action and check intermediate state
    //   const createPromise = listCreate({ name: "New foo" })
    //   const todosSelector = todoList.selector(store.getState())

    //   t.deepEquals(
    //     todosSelector.itemCreating(),
    //     { name: "New foo" },
    //     "before - itemCreating should contain the create data"
    //   )

    //   t.equals(
    //     todosSelector.isCreating(),
    //     true,
    //     "before - isCreating flag should be true while creating"
    //   )

    //   return createPromise
    // })
    .then(({ result }) => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        todosSelector.creating(),
        {},
        "after - itemCreating is empty"
      )

      t.deepEquals(
        result,
        { id: 1, name: "New foo" },
        "after - list.create resolves with created item"
      )

      t.equals(
        todosSelector.isCreating(),
        false,
        "after - isCreating flag should be false after creating"
      )

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "New foo" }],
        "after - element should be added to items array"
      )
    })
    .finally(() => t.end())
})

test("Create - caching", t => {
  // WHAT TO TEST
  const todoList = buildCollection({
    name: "CREATE-CACHE_TODOS",
    cacheTTL: 100,
    methods: {
      find: () => [{ id: 1, name: "foo" }],
      create: data => ({
        id: 2,
        ...data,
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
  const listCreate = todoList.create(store.dispatch)
  const listFind = todoList.find(store.dispatch)

  // eslint-disable-next-line promise/catch-or-return
  listFind()
    .then(() => listCreate({ name: "New foo" }))
    .then(({ result }) => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        result,
        { id: 2, name: "New foo" },
        "after - list.create resolves with created item"
      )

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "foo" }, { id: 2, name: "New foo" }],
        "after - element should be added to items array"
      )
    })
    .finally(() => t.end())
})
