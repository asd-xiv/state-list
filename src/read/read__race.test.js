import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Read - race conditions", async t => {
  let callCount = 0

  // WHAT TO TEST
  const todos = buildList({
    name: "READ_RACE_TODOS",
    read: () => {
      callCount++

      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            { id: 1, name: "lorem ipsum" },
            { id: 2, name: "foo bar" },
          ])
        }, 100)
      })
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  await Promise.all([
    todos.read(),
    todos.read(),
    todos.read(),
    todos.read(),
    todos.read(),
    todos.read(),
    new Promise(resolve => {
      // run another .read after the others ended
      setTimeout(() => {
        resolve(todos.read())
      }, 150)
    }),
  ])

  t.equals(
    callCount,
    2,
    "Multiple same signature calls should not trigger until first one ended"
  )

  t.end()
})
