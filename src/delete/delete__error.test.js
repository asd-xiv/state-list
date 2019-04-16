import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from ".."

// Dummy Error with api data inside
class RequestError extends Error {
  constructor(message, { body, status }) {
    super(`${status}:${message}`)

    this.name = "RequestError"
    this.status = status
    this.body = body
  }
}

test("Delete - error", t => {
  // WHAT TO TEST
  const todoList = buildList({
    name: "DELETE-ERROR_TODOS",
    methods: {
      find: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
      delete: id => {
        return id === 2
          ? Promise.reject(
              new RequestError("Something something API crash", {
                body: { message: "resource not found" },
                status: 404,
              })
            )
          : Promise.resolve({ id: 1 })
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
  const listFind = todoList.find(store.dispatch)
  const listDelete = todoList.delete(store.dispatch)

  listFind()
    .then(() => listDelete(2))
    .then(({ error }) => {
      const todosSelector = todoList.selector(store.getState())
      const stateError = todosSelector.error("delete")

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
          body: { message: "resource not found" },
          status: 404,
        },
        `Resolved error data same as slide data`
      )
    })
    .then(() => listDelete(1))
    .then(({ error }) => {
      const todosSelector = todoList.selector(store.getState())
      const stateError = todosSelector.error("delete")

      t.equals(
        stateError,
        null,
        "State error is set to null after successfull delete"
      )

      t.equals(
        error,
        undefined,
        "Resolved error is null after successfull delete"
      )

      t.end()
    })
})
