import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Read - race conditions", t => {
  let callCount = 0

  // WHAT TO TEST
  const todoList = buildList("READ_RACE_TODOS", {
    read: () => {
      callCount++

      return new Promise(resolve => {
        setTimeout(() => {
          resolve([{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }])
        }, 500)
      })
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's action to store's dispatch
  const listRead = todoList.read(store.dispatch)

  return Promise.resolve()
    .then(() =>
      Promise.all([
        listRead(),
        listRead(),
        listRead(),
        new Promise(resolve => {
          // run another .read after the other 3 ended
          setTimeout(() => {
            resolve(listRead())
          }, 550)
        }),
      ])
    )
    .finally(() => {
      t.equals(
        callCount,
        2,
        "Multiple same signature calls should not trigger until first one ended"
      )

      t.end()
    })
})
