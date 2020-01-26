import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList, useList } from "."

test("List without API methods", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "TODOS",
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  t.equals(todos.name, "TODOS", "New list created with unique name")

  t.throws(
    () => {
      buildList({ name: "TODOS" })
    },
    /ReduxList: List with name "TODOS" already exists/,
    "Throw exception when creating a list with a duplicate name"
  )

  t.throws(
    () => {
      buildList()
    },
    /ReduxList: "name" property is required, received "undefined"/,
    "Throw exception when creating a list without any params"
  )

  const { selector, create, read, readOne, update, remove, clear } = useList(
    todos,
    store.dispatch
  )
  const {
    head,
    items,
    creating,
    removing,
    updating,
    isCreating,
    isLoaded,
    isLoading,
    isUpdating,
    isRemoving,
  } = selector(store.getState())

  t.deepEquals(
    {
      head: head(),
      items: items(),
      creating: creating(),
      updating: updating(),
      removing: removing(),
      isCreating: isCreating(),
      isLoaded: isLoaded(),
      isLoading: isLoading(),
      isUpdating: isUpdating(),
      isRemoving: isRemoving(),
    },
    {
      head: undefined,
      items: [],
      updating: [],
      removing: [],
      creating: [],
      isLoading: false,
      isLoaded: false,
      isCreating: false,
      isUpdating: false,
      isRemoving: false,
    },
    "Default state initialized in redux store via list selector"
  )

  t.throws(
    () => {
      create({ id: 2 })
    },
    /ReduxList: "TODOS"."create" must be a function, got "undefined"/,
    'Throw exception when calling "create" on list without methods'
  )

  t.throws(
    () => {
      read()
    },
    /ReduxList: "TODOS"."read" must be a function, got "undefined"/,
    'Throw exception when calling "read" on list without methods'
  )

  t.throws(
    () => {
      readOne()
    },
    /ReduxList: "TODOS"."readOne" must be a function, got "undefined"/,
    'Throw exception when calling "readOne" on list without methods'
  )

  t.throws(
    () => {
      update(1, { test: 2 })
    },
    /ReduxList: "TODOS"."update" must be a function, got "undefined"/,
    'Throw exception when calling "update" on list without methods'
  )

  t.throws(
    () => {
      remove(1, { test: 2 })
    },
    /ReduxList: "TODOS"."remove" must be a function, got "undefined"/,
    'Throw exception when calling "remove" on list without methods'
  )

  await clear()

  t.deepEquals(
    selector(store.getState()).items(),
    [],
    "Builtin .clear should remove all items from state"
  )

  t.end()
})
