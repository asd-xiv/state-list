import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Find", t => {
  // WHAT TO TEST
  const todoList = buildList({
    name: "FIND_TODOS",
    methods: {
      find: () => [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's action to store's dispatch
  const listFind = todoList.find(store.dispatch)

  Promise.resolve()
    .then(() => {
      // Trigger find action and check intermediate state
      const findPromise = listFind()
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(todosSelector.items(), [], "items array should be empty")
      t.equals(
        todosSelector.isLoaded(),
        false,
        "isLoaded flag should be false before loading"
      )
      t.equals(
        todosSelector.isLoading(),
        true,
        "isLoading flag should be true while loading"
      )

      return findPromise
    })
    .then(items => {
      // Check state after find
      const todosSelector = todoList.selector(store.getState())

      t.equals(
        todosSelector.isLoaded(),
        true,
        "isLoaded flag should be true after loading"
      )
      t.equals(
        todosSelector.isLoading(),
        false,
        "isLoading flag should be false after loading"
      )
      t.deepEquals(
        items,
        [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
        "list.find resolves with retrived items"
      )
      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
        "elements should be set in items array"
      )
      t.deepEquals(
        todosSelector.head(),
        { id: 1, name: "lorem ipsum" },
        "head selector returns first element from items array"
      )
      t.deepEquals(
        todosSelector.byId(2),
        { id: 2, name: "foo bar" },
        "byId selector returns element from items array"
      )
    })
    .then(() => t.end())
    .catch()
})
