import test from "tape"
import { createStore, combineReducers } from "redux"
import { random } from "@asd14/m"

import { buildList } from "."

test("buildList", t => {
  /**
   * List without any methods defined
   */
  const emptyList = buildList({
    name: "test",
    methods: {},
  })

  const emptyStore = createStore(
    combineReducers({
      [emptyList.name]: emptyList.reducer,
    })
  )

  const emptyListCreate = emptyList.create(emptyStore.dispatch)
  const emptyListFind = emptyList.find(emptyStore.dispatch)
  const emptyListUpdate = emptyList.update(emptyStore.dispatch)
  const emptyListDelete = emptyList.delete(emptyStore.dispatch)

  t.throws(
    () => {
      emptyListCreate({ id: 2 })
    },
    /ReduxAllIsList - "test": Expected "create" action of type Function, got "Undefined"/,
    'Run "create" on list without methods'
  )

  t.throws(
    () => {
      emptyListFind()
    },
    /ReduxAllIsList - "test": Expected "find" action of type Function, got "Undefined"/,
    'Run "find" on list without methods'
  )

  t.throws(
    () => {
      emptyListUpdate(1, { test: 2 })
    },
    /ReduxAllIsList - "test": Expected "update" action of type Function, got "Undefined"/,
    'Run "update" on list without methods'
  )

  t.throws(
    () => {
      emptyListDelete(1, { test: 2 })
    },
    /ReduxAllIsList - "test": Expected "delete" action of type Function, got "Undefined"/,
    'Run "delete" on list without methods'
  )

  /**
   * Empty list
   */
  const testList = buildList({
    name: "test",
    methods: {
      create: data => ({
        id: random({ min: 0, max: 1000 }),
        ...data,
      }),
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

  createStore(
    combineReducers({
      [testList.name]: testList.reducer,
    })
  )

  t.equals(testList.name, "test", "New list created with unique name")

  t.end()
})
