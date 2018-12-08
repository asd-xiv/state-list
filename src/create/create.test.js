import test from "tape"
import { createStore, combineReducers } from "redux"
import { random } from "@asd14/m"

import { buildList } from ".."

test("Create", t => {
  t.plan(2)

  const todoList = buildList({
    name: "TODOS",
    methods: {
      create: data =>
        Promise.resolve({
          id: random({ min: 0, max: 1000 }),
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

  // Link lists's actions to store
  const listCreate = todoList.create(store.dispatch)

  listCreate({ name: "New foo" })
    .then(itemCreated => {
      const state = store.getState()[todoList.name]

      t.equals(
        itemCreated.name,
        "New foo",
        "list.create resolves with created item"
      )

      t.equals(
        state.items.length,
        1,
        "list.create added new item to slice.items"
      )
    })
    .catch()
})
