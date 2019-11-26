import test from "tape"
import { createStore, combineReducers } from "redux"
import { sortWith } from "@mutantlove/m"

import { buildList, useList } from ".."

test("Read", async t => {
  // WHAT TO TEST
  const todos = buildList("READ_TODOS", {
    read: setNo =>
      Promise.resolve(
        setNo === 1
          ? [
              { id: 1, name: "lorem ipsum" },
              { id: 2, name: "foo bar" },
            ]
          : [
              { id: 1, name: "replaced ipsum" },
              { id: 3, name: "shouldClear is false" },
            ]
      ),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read } = useList(todos, store.dispatch)

  // Trigger read action and check intermediate state
  const { result } = await Promise.resolve().then(() => {
    const readPromise = read(1)
    const { items, isLoaded } = selector(store.getState())

    t.deepEquals(items(), [], "items array should be empty")
    t.equals(isLoaded(), false, "isLoaded flag should be false before loading")

    return readPromise
  })

  {
    // Check state after read
    const { items, byId, head, isLoaded, isLoading } = selector(
      store.getState()
    )

    t.equals(isLoaded(), true, "isLoaded flag should be true after loading")
    t.equals(isLoading(), false, "isLoading flag should be false after loading")
    t.deepEquals(result, items(), "list.read resolves with retrived items")

    t.deepEquals(
      items(),
      [
        { id: 1, name: "lorem ipsum" },
        { id: 2, name: "foo bar" },
      ],
      "elements should be set in items array"
    )

    t.deepEquals(
      head(),
      { id: 1, name: "lorem ipsum" },
      "head selector returns first element from items array"
    )

    t.deepEquals(
      byId(2),
      { id: 2, name: "foo bar" },
      "byId selector returns element from items array"
    )
  }

  {
    await read(2, { shouldClear: false })
    const { items } = selector(store.getState())

    t.deepEquals(
      sortWith("id")(items()),
      [
        { id: 1, name: "replaced ipsum" },
        { id: 2, name: "foo bar" },
        { id: 3, name: "shouldClear is false" },
      ],
      "Loading with shouldClear: false should append resulting items to already existing items"
    )
  }

  t.end()
})
