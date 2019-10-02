import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList, useList } from ".."

// Dummy Error with api data inside
class RequestError extends Error {
  constructor(message, { body, status }) {
    super(`${status}:${message}`)

    this.name = "RequestError"
    this.status = status
    this.body = body
  }
}

test("Update - error", async t => {
  // WHAT TO TEST
  const todos = buildList("UPDATE-ERROR_TODOS", {
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    update: (id, data) => {
      return id === 3
        ? Promise.reject(
            new RequestError("Something something API crash", {
              body: { message: "resource not found" },
              status: 404,
            })
          )
        : Promise.resolve({ id, ...data })
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read, update } = useList(todos, store.dispatch)

  await read()

  {
    const { error } = await update(3, { name: "updated name" })
    const stateError = selector(store.getState()).error("update")

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
  }
  {
    const { error } = await update(1, { name: "updated name" })
    const stateError = selector(store.getState()).error("update")

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
  }

  t.end()
})
