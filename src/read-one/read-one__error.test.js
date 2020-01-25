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

test("ReadOne - error", async t => {
  t.plan(5)

  // WHAT TO TEST
  const todos = buildList("READ-ONE-ERROR_TODOS", {
    read: () => [{ id: 1, name: "build gdpr startup" }, { id: 2 }],
    readOne: (id, data) => {
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

  const { selector, read, readOne } = useList(todos, store.dispatch)

  await read()

  {
    const { error } = await readOne(3, {
      name: "updated name",
      blue: "monday",
    })
    const stateError = selector(store.getState()).error("readOne")

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

  try {
    await readOne()
  } catch (error) {
    t.equals(
      error.message,
      `ReduxList: "READ-ONE-ERROR_TODOS".readOne ID param missing. Expected something, got "undefined"`
    )
  }

  {
    const { error } = await readOne(1, {
      description: "updated item",
    })
    const stateError = selector(store.getState()).error("readOne")

    t.equals(
      stateError,
      null,
      "State error is set to null after successfull readOne"
    )

    t.equals(
      error,
      undefined,
      "Resolved error is null after successfull readOne"
    )
  }
})
