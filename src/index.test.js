import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from "."

test("List without API methods", t => {
  const todoList = buildList({
    name: "TODOS",
    methods: {},
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todoList.name]: todoList.reducer,
    })
  )

  // Link lists's actions to store
  const listCreate = todoList.create(store.dispatch)
  const listFind = todoList.find(store.dispatch)
  const listUpdate = todoList.update(store.dispatch)
  const listDelete = todoList.delete(store.dispatch)

  t.equals(todoList.name, "TODOS", "New list created with unique name")

  t.deepEquals(
    store.getState()[todoList.name],
    {
      items: [],
      itemsUpdating: [],
      itemsDeletingIds: [],
      errors: [],
      loadDate: null,
      isLoading: false,
      isReloading: false,
      isCreating: false,
    },
    "Default state initialized in redux store"
  )

  t.throws(
    () => {
      listCreate({ id: 2 })
    },
    /ReduxAllIsList - "TODOS": Expected "create" action of type Function, got "Undefined"/,
    'Throw exception when calling "create" on list without methods'
  )

  t.throws(
    () => {
      listFind()
    },
    /ReduxAllIsList - "TODOS": Expected "find" action of type Function, got "Undefined"/,
    'Throw exception when calling "find" on list without methods'
  )

  t.throws(
    () => {
      listUpdate(1, { test: 2 })
    },
    /ReduxAllIsList - "TODOS": Expected "update" action of type Function, got "Undefined"/,
    'Throw exception when calling "update" on list without methods'
  )

  t.throws(
    () => {
      listDelete(1, { test: 2 })
    },
    /ReduxAllIsList - "TODOS": Expected "delete" action of type Function, got "Undefined"/,
    'Throw exception when calling "delete" on list without methods'
  )

  t.end()
})
