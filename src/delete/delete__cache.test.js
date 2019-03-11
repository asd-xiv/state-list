import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildCollection } from ".."

test("Delete - caching", t => {
  // WHAT TO TEST
  const todoList = buildCollection({
    name: "DELETE-CACHE_TODOS",
    cacheTTL: 1000,
    methods: {
      find: () => [{ id: 1, name: "lorem ipsum" }, { id: 2, name: "foo bar" }],
      delete: id => ({
        id,
      }),
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
  const listDelete = todoList.delete(store.dispatch)

  listFind()
    .then(() => listDelete(2))
    .then(({ result }) => {
      const todosSelector = todoList.selector(store.getState())

      t.equals(result.id, 2, "list.delete resolves with element id")

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "lorem ipsum" }],
        "element should be removed from items array"
      )
    })
    .finally(() => t.end())
})
