import test from "tape"
import { createStore, combineReducers } from "redux"
import { sortWith, map, pick } from "@asd14/m"

import { buildList } from ".."

test("Read", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "READ_TODOS",
    read: setNo => {
      switch (setNo) {
        case 1:
          return [
            { id: 1, name: "lorem ipsum" },
            { id: 2, name: "foo bar" },
          ]
        case 2:
          return [
            { id: 1, name: "replaced ipsum" },
            { id: 3, name: "shouldClear is false" },
          ]
        default:
          return { id: 4, name: "im lonely" }
      }
    },
    onChange: map(item => ({ ...item, onChange: true })),
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  // Trigger read action and check intermediate state
  const { result } = await Promise.resolve().then(() => {
    const readPromise = todos.read(1)
    const { items, isLoaded } = todos.selector(store.getState())

    t.deepEquals(items(), [], "items array should be empty")
    t.equals(isLoaded(), false, "isLoaded flag should be false before loading")

    return readPromise
  })

  {
    // Check state after read
    const { items, byId, head, isLoaded, isLoading } = todos.selector(
      store.getState()
    )

    t.equals(isLoaded(), true, "isLoaded flag should be true after loading")
    t.equals(isLoading(), false, "isLoading flag should be false after loading")
    t.deepEquals(
      result,

      // selecting only remote fields since items() will also contain
      // onChange changes
      map(pick(["id", "name"]))(items()),
      "list.read resolves with retrived items"
    )

    t.deepEquals(
      items(),
      [
        { id: 1, name: "lorem ipsum", onChange: true },
        { id: 2, name: "foo bar", onChange: true },
      ],
      "elements should be set in items array"
    )

    t.deepEquals(
      head(),
      { id: 1, name: "lorem ipsum", onChange: true },
      "head selector returns first element from items array"
    )

    t.deepEquals(
      byId(2),
      { id: 2, name: "foo bar", onChange: true },
      "byId selector returns element from items array"
    )

    t.equals(
      byId(123),
      undefined,
      "byId selector returns undefined when element not found and no default set"
    )

    t.deepEquals(
      byId(123, {}),
      {},
      "byId selector returns default when element not found"
    )
  }

  {
    await todos.read(2, { shouldClear: false })
    const { items, hasWithId } = todos.selector(store.getState())

    t.deepEquals(
      sortWith("id")(items()),
      [
        { id: 1, name: "replaced ipsum", onChange: true },
        { id: 2, name: "foo bar", onChange: true },
        { id: 3, name: "shouldClear is false", onChange: true },
      ],
      "Loading with shouldClear: false should append resulting items to already existing items"
    )

    t.equals(
      hasWithId(1),
      true,
      "hasWithId selector returns true when item exists"
    )

    t.equals(
      hasWithId(4),
      false,
      "hasWithId selector returns false when item does not exists"
    )
  }

  {
    await todos.clear()
    const { items } = todos.selector(store.getState())

    t.deepEquals(
      items(),
      [],
      "Clearing list with items should return empty array"
    )
  }

  {
    await todos.read()
    const { items } = todos.selector(store.getState())

    t.deepEquals(
      items(),
      [{ id: 4, name: "im lonely", onChange: true }],
      ".read returning a non-array result will still add"
    )
  }

  t.end()
})
