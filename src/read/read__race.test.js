import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList, useList } from ".."

test("Read - race conditions", async t => {
  let callCount = 0

  // WHAT TO TEST
  const todos = buildList("READ_RACE_TODOS", {
    read: () => {
      callCount++

      return new Promise(resolve => {
        setTimeout(() => {
          resolve([{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }])
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

  const { read } = useList(todos, store.dispatch)

  await Promise.all([
    read(),
    read(),
    read(),
    read(),
    read(),
    read(),
    new Promise(resolve => {
      // run another .read after the others ended
      setTimeout(() => {
        resolve(read())
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
