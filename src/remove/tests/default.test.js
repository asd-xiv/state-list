import test from "tape"
import { createStore, combineReducers } from "redux"
import { map } from "@asd14/m"

import { buildList } from "../.."

test("Remove", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "DELETE_TODOS",
    read: () => [
      { id: 1, name: "lorem ipsum" },
      { id: 2, name: "foo bar" },
    ],
    remove: (id, options) => ({ id, options }),
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

  todos.set({ dispatch: store.dispatch })

  {
    await todos.read()

    const { result } = await todos.remove(2, {
      testOption: "other",
    })
    const { items, isRemoving } = todos.selector(store.getState())

    t.deepEquals(
      result,
      {
        id: 2,
        options: { isLocal: false, testOption: "other" },
      },
      "list.remove resolves with element id"
    )

    t.deepEquals(
      items(),
      [{ id: 1, name: "lorem ipsum", onChange: 1 }],
      "element should be removed from items array"
    )

    t.equals(
      isRemoving(result.id),
      false,
      "isRemoving by id flag should be false after deleting"
    )

    t.equals(
      isRemoving(),
      false,
      "isRemoving flag should be false after deleting"
    )
  }
  {
    await todos.read()

    const { result } = await todos.remove(2, {
      isLocal: true,
    })
    const { items } = todos.selector(store.getState())

    t.deepEquals(
      result,
      { id: 2 },
      "Local .remove() resolves with id without calling method"
    )

    t.deepEquals(
      items(),
      [{ id: 1, name: "lorem ipsum", onChange: 1 }],
      "Remove local element should be delete from items array"
    )
  }

  t.end()
})
