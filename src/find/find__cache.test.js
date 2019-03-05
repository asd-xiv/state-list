import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Find - caching", t => {
  // WHAT TO TEST
  let findCount = 0
  const todoList = buildList({
    name: "FIND-CACHE_TODOS",
    cacheTTL: 2000,
    methods: {
      find: () => {
        findCount++

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

  // Run 2 finds, wait 10ms, run 2 more finds
  //
  // T0 Find 1:
  //   - queue is empty, add action to queue and run
  //   - cache is empty, run fn
  //
  // T0 Find 2:
  //   - queue has prev action still running, return existing action promise
  //   - cache is still empty (not called since action not called)
  //
  // T1 Find 3
  //   - queue is empty since prev API finished, add action to queue and run
  //   - cache has stored results from Find 1, return cached value
  //
  // T1 Find 4
  //   - queue has prev action that is still running (Find 3), return
  //   existing promise
  //   - cache still has stored results from Find 1 (not called since action
  //   not called)
  Promise.all([listFind(), listFind()])
    .then(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve(Promise.all([listFind(), listFind()]))
          }, 10)
        })
    )
    .then(() => {
      t.equals(
        findCount,
        1,
        "Running find 4 times in batches of 2. Should run only once due to the queue and cache"
      )
    })
    .finally(() => t.end())
})
