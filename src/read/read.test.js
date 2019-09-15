import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Read", t => {
  // WHAT TO TEST
  const todoList = buildList("READ_TODOS", {
    read: () => [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's action to store's dispatch
  const listRead = todoList.read(store.dispatch)

  Promise.resolve()
    .then(() => {
      // Trigger read action and check intermediate state
      const readPromise = listRead()
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(todosSelector.items(), [], "items array should be empty")
      t.equals(
        todosSelector.isLoaded(),
        false,
        "isLoaded flag should be false before loading"
      )

      return readPromise
    })
    .then(items => {
      // Check state after read
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
        "list.read resolves with retrived items"
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

      t.end()
    })
})
