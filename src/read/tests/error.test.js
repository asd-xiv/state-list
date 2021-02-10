import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from "../.."

// Dummy Error with api data inside
class RequestError extends Error {
  constructor(message, { body, status }) {
    super(`${status}:${message}`)

    this.name = "RequestError"
    this.status = status
    this.body = body
  }
}

test("Read - error", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "READ-ERROR_TODOS",
    read: ({ shouldThrow }) => {
      if (shouldThrow) {
        throw new RequestError("Something something API crash", {
          body: { validationData: "from server" },
          status: 409,
        })
      }

      return []
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.set({ dispatch: store.dispatch })

  {
    const { error } = await todos.read({ shouldThrow: true })

    t.deepEquals(
      error,
      todos.selector(store.getState()).error("read"),
      `Error data set to state equals error data the action promise resolves to`
    )

    t.deepEquals(
      {
        body: error.body,
        status: error.status,
      },
      {
        body: { validationData: "from server" },
        status: 409,
      },
      `Resolved error data same as slide data`
    )
  }

  {
    const { error } = await todos.read({ shouldThrow: false })

    t.equals(
      todos.selector(store.getState()).error("read"),
      null,
      "State error is set to null after successfull read"
    )

    t.equals(error, undefined, "Resolved error is null after successfull read")
  }

  t.end()
})
