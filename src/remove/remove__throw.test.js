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

      return { id }
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
      `ReduxList: "DELETE-ERROR_TODOS".remove ID param missing. Expected something, got "undefined"`,
      "remove method called without valid id parameter should throw error"
    )
  }

  {
    const { error } = await remove(2)

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

    t.deepEquals(
      error,
      selector(store.getState()).error("remove"),
      `Error data set to state equals error data the action promise resolves to`
    )
  }

  {
    const { error } = await remove(1)

    t.equals(
      error,
      undefined,
      "Resolved error is null after successfull delete"
    )

    t.equals(
      selector(store.getState()).error("remove"),
      null,
      "State error is set to null after successfull delete"
    )
  }

  {
    const { error } = await remove(1)

    t.equals(
      error.data.message,
      `ReduxList: "DELETE-ERROR_TODOS".remove ID "1" does not exist`,
      "Calling .remove with id that does not exist should throw error"
    )
  }

  t.end()
})
