import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Create - caching", t => {
  // WHAT TO TEST
  const todoList = buildList({
    name: "CREATE-CACHE_TODOS",
    cacheTTL: 1000,
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
    .then(itemCreated => {
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        itemCreated,
        { id: 2, name: "New foo" },
        "create resolves with created item"
      )

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "foo" }, { id: 2, name: "New foo" }],
        "element should be added to items array"
      )
    })
    .finally(() => t.end())
})
