import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Delete", t => {
  // WHAT TO TEST
  const todoList = buildList({
    name: "DELETE_TODOS",
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
    // .then(() => {
    //   // Trigger delete action and check intermediate state
    //   const deletePromise = listDelete(2)

    //   console.log(store.getState())
    //   const todosSelector = todoList.selector(store.getState())

    //   t.equals(
    //     todosSelector.isDeleting(2),
    //     true,
    //     "isDeleting by id flag should be true while deleting"
    //   )
    //   t.equals(
    //     todosSelector.isDeleting(),
    //     true,
    //     "isDeleting flag should be true while deleting"
    //   )
    //   t.deepEquals(
    //     todosSelector.itemsDeletingIds(),
    //     [2],
    //     "array with deleting ids should contain current deleting id"
    //   )

    //   return deletePromise
    // })
    .then(({ result }) => {
      const todosSelector = todoList.selector(store.getState())

      t.equals(result.id, 2, "list.delete resolves with element id")

      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "lorem ipsum" }],
        "element should be removed from items array"
      )

      t.equals(
        todosSelector.isDeleting(result.id),
        false,
        "isDeleting by id flag should be false after deleting"
      )

      t.equals(
        todosSelector.isDeleting(),
        false,
        "isDeleting flag should be false after deleting"
      )
    })
    .finally(() => t.end())
})
