import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Create - caching", t => {
  // WHAT TO TEST
  const todoList = buildList({
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

  listFind()
    .then(() => listCreate({ name: "New foo" }))
    .then(({ result }) => {
      const selector = todoList.selector(store.getState())

      t.deepEquals(
        result,
        { id: 2, name: "New foo" },
        "list.create resolves with created item"
      )

      t.deepEquals(
        selector.items(),
        [{ id: 1, name: "foo" }, { id: 2, name: "New foo" }],
        "Element should be added to items array"
      )

      t.end()
    })
})
