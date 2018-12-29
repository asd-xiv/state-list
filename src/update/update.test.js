import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

test("Update", t => {
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
      update: (id, data) => ({
        id,
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
  const listFind = todoList.find(store.dispatch)
  const listUpdate = todoList.update(store.dispatch)

  listFind()
    .then(() => listUpdate(2, { name: "Updated foo" }))
    .then(itemUpdated => {
      const listState = store.getState()[todoList.name]

      t.equals(
        listState.items.length,
        2,
        "list.update didnt remove or add any new elements"
      )

      t.deepEquals(
        itemUpdated,
        { id: 2, name: "Updated foo" },
        "list.update resolves with created item"
      )
    })
    .then(() => t.end())
    .catch()
})
