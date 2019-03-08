import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildCollection } from ".."

// Dummy Error with api data inside
class RequestError extends Error {
  constructor(message, { body, status }) {
    super(`${status}:${message}`)

    this.name = "RequestError"
    this.status = status
    this.body = body
  }
}

test("Create - error", t => {
  // WHAT TO TEST
  const todoList = buildCollection({
    name: "CREATE-ERROR_TODOS",
    methods: {
      find: () => [],
      create: ({ name }) => {
        return name === "throw"
          ? Promise.reject(
              new RequestError("Something something API crash", {
                body: { validationData: "from server" },
                status: 409,
              })
            )
          : Promise.resolve({ id: 1, name })
      },
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
    .then(() => listCreate({ name: "throw" }))
    .then(({ error }) => {
      const todosSelector = todoList.selector(store.getState())
      const stateError = todosSelector.error("create")

      t.deepEquals(
        error,
        stateError,
        `Error data set to state equals error data the action promise resolves to`
      )

      t.deepEquals(
        {
          body: error.data.body,
          status: error.data.status,
        },
        {
          body: { validationData: "from server" },
          status: 409,
        },
        `Resolved error data same as slide data`
      )
    })
    .then(() => listCreate({ name: "dont throw" }))
    .then(({ error }) => {
      const todosSelector = todoList.selector(store.getState())
      const stateError = todosSelector.error("create")

      t.equals(
        stateError,
        null,
        "State error is set to null after successfull create"
      )

      t.equals(
        error,
        undefined,
        "Resolved error is null after successfull create"
      )
    })
    .finally(() => t.end())
})
