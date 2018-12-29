import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Create", t => {
  // WHAT TO TEST
  const todoList = buildList({
    name: "CREATE_TODOS",
    methods: {
      find: () => [],
      create: data => ({
        id: 1,
        ...data,
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
  const listCreate = todoList.create(store.dispatch)
  const listFind = todoList.find(store.dispatch)

  listFind()
    .then(() => {
      // Trigger create action and check intermediate state
      const createPromise = listCreate({ name: "New foo" })
      const todosSelector = todoList.selector(store.getState())

      t.equals(
        todosSelector.isCreating(),
        true,
        "isCreating flag should be true while creating"
      )

      return createPromise
    })
    .then(itemCreated => {
      // Check state after create
      const todosSelector = todoList.selector(store.getState())

      t.deepEquals(
        itemCreated,
        { id: 1, name: "New foo" },
        "list.create resolves with created item"
      )
      t.equals(
        todosSelector.isCreating(),
        false,
        "isCreating flag should be false after creating"
      )
      t.deepEquals(
        todosSelector.items(),
        [{ id: 1, name: "New foo" }],
        "element should be added to items array"
      )
    })
    .then(() => t.end())
    .catch()
})
