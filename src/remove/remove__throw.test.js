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

test("Remove - error", async t => {
  t.plan(5)

  // WHAT TO TEST
  const todos = buildList("DELETE-ERROR_TODOS", {
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    remove: id => {
      if (id === 2) {
        throw new RequestError("Something something API crash", {
          body: { message: "resource not found" },
          status: 404,
        })
      }

      return { id: 1 }
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  const { selector, read, remove } = useList(todos, store.dispatch)

  await read()

  try {
    await remove()
  } catch (error) {
    t.equals(
      error.message,
      `ReduxList: removeAction - cannot call remove method without a valid "id" param. Expected something, got "undefined"`,
      "remove method called without valid id parameter should throw error"
    )
  }

  {
    const { error } = await remove(2)
    const stateError = selector(store.getState()).error("remove")

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
    const { error } = await remove(1)
    const stateError = selector(store.getState()).error("remove")

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
})
