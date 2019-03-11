import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildCollection } from "."

test("List without API methods", t => {
  // WHAT TO TEST
  const todoList = buildCollection({
    name: "TODOS",
    cache: 1,
    methods: {},
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
  const listUpdate = todoList.update(store.dispatch)
  const listDelete = todoList.delete(store.dispatch)

  t.equals(todoList.name, "TODOS", "New list created with unique name")

  t.throws(
    () => {
      buildCollection({ name: "TODOS" })
    },
    /ReduxCollections: List with name "TODOS" already exists/,
    "Throw exception when creating a list with a duplicate name"
  )

  const todosSelector = todoList.selector(store.getState())

  t.deepEquals(
    {
      head: todosSelector.head(),
      items: todosSelector.items(),
      creating: todosSelector.creating(),
      updating: todosSelector.updating(),
      deleting: todosSelector.deleting(),
      isCreating: todosSelector.isCreating(),
      isLoaded: todosSelector.isLoaded(),
      isLoading: todosSelector.isLoading(),
      isUpdating: todosSelector.isUpdating(),
      isDeleting: todosSelector.isDeleting(),
    },
    {
      head: undefined,
      items: [],
      updating: [],
      deleting: [],
      creating: [],
      isLoading: false,
      isLoaded: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    },
    "Default state initialized in redux store via list selector"
  )

  t.throws(
    () => {
      listCreate({ id: 2 })
    },
    /ReduxCollections: "TODOS"."create" should be a function, got "undefined"/,
    'Throw exception when calling "create" on list without methods'
  )

  t.throws(
    () => {
      listFind()
    },
    /ReduxCollections: "TODOS"."find" should be a function, got "undefined"/,
    'Throw exception when calling "find" on list without methods'
  )

  t.throws(
    () => {
      listUpdate(1, { test: 2 })
    },
    /ReduxCollections: "TODOS"."update" should be a function, got "undefined"/,
    'Throw exception when calling "update" on list without methods'
  )

  t.throws(
    () => {
      listDelete(1, { test: 2 })
    },
    /ReduxCollections: "TODOS"."delete" should be a function, got "undefined"/,
    'Throw exception when calling "delete" on list without methods'
  )

  t.end()
})
