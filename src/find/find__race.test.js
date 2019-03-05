import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Find - race conditions", t => {
  let callCount = 0

  // WHAT TO TEST
  const todoList = buildList({
    name: "FIND_RACE_TODOS",
    methods: {
      find: () => {
        callCount++

        return new Promise(resolve => {
          setTimeout(() => {
            resolve([
              { id: 1, name: "lorem ipsum" },
              { id: 2, name: "foo bar" },
            ])
          }, 500)
        })
      },
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

  return Promise.resolve()
    .then(() =>
      Promise.all([
        listFind(),
        listFind(),
        listFind(),
        new Promise(resolve => {
          // run another find after the other 3 ended
          setTimeout(() => {
            resolve(listFind())
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
