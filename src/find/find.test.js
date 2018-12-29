import test from "tape"
import { createStore, combineReducers } from "redux"
import { type } from "@asd14/m"

import { buildList } from ".."

test("Find", t => {
  const todoList = buildList({
    name: "TODOS",
    methods: {
      find: () => [
        {
          id: 1,
          name: "lorem ipsum",
        },
        {
          id: 2,
          name: "foo bar",
        },
      ],
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's actions to store
  const listFind = todoList.find(store.dispatch)

  listFind()
    .then(items => {
      const state = store.getState()[todoList.name]

      t.deepEquals(
        items,
        [
          {
            id: 1,
            name: "lorem ipsum",
          },
          {
            id: 2,
            name: "foo bar",
          },
        ],
        "list.find resolves to retrived items"
      )

      t.deepEquals(
        state.items,
        [
          {
            id: 1,
            name: "lorem ipsum",
          },
          {
            id: 2,
            name: "foo bar",
          },
        ],
        "list.find sets items to state.items"
      )

      t.equals(
        type(state.loadDate),
        "Date",
        "list.find sets slice.loadDate as Date object"
      )
    })
    .then(() => t.end())
    .catch()
})
