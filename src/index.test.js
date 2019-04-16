import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from "."

test("List without API methods", t => {
  // WHAT TO TEST
  const todoList = buildList({
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

  const listAdd = todoList.add(store.dispatch)
  const listClear = todoList.clear(store.dispatch)

  t.equals(todoList.name, "TODOS", "New list created with unique name")

  t.throws(
    () => {
      buildList({ name: "TODOS" })
    },
    /ReduxAllIsList: List with name "TODOS" already exists/,
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
    /ReduxAllIsList: "TODOS"."create" should be a function, got "undefined"/,
    'Throw exception when calling "create" on list without methods'
  )

  t.throws(
    () => {
      listFind()
    },
    /ReduxAllIsList: "TODOS"."find" should be a function, got "undefined"/,
    'Throw exception when calling "find" on list without methods'
  )

  t.throws(
    () => {
      listUpdate(1, { test: 2 })
    },
    /ReduxAllIsList: "TODOS"."update" should be a function, got "undefined"/,
    'Throw exception when calling "update" on list without methods'
  )

  t.throws(
    () => {
      listDelete(1, { test: 2 })
    },
    /ReduxAllIsList: "TODOS"."delete" should be a function, got "undefined"/,
    'Throw exception when calling "delete" on list without methods'
  )

  listAdd({ id: 1, foo: "bar" })
    .then(result => {
      const selector = todoList.selector(store.getState())

      t.deepEquals(
        { id: 1, foo: "bar" },
        result,
        "Builtin .add should resolve with passed item"
      )

      t.deepEquals(
        selector.items(),
        [result],
        "Builtin .add should add item to state"
      )
    })
    .then(() => listClear())
    .then(() => {
      const selector = todoList.selector(store.getState())

      t.deepEquals(
        selector.items(),
        [],
        "Builtin .clear should remove all items from state"
      )
    })
    .then(() => listAdd([{ id: 1, foo: "bar" }, { id: 2, foo: "bar2" }]))
    .then(() => {
      const selector = todoList.selector(store.getState())

      t.deepEquals(
        selector.items(),
        [{ id: 1, foo: "bar" }, { id: 2, foo: "bar2" }],
        "Builtin .add should add items to state"
      )
    })
    .then(() => t.end())
})
