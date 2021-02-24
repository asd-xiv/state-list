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

test("ReadOne - error", async t => {
  t.plan(5)

  // WHAT TO TEST
  const todos = buildList({
    name: "READ-ONE-ERROR_TODOS",
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

  todos.set({ dispatch: store.dispatch })

  await todos.read()

  {
    const { error } = await todos.readOne(3, {
      name: "updated name",
      blue: "monday",
    })

    t.deepEquals(
      error,
      todos.selector(store.getState()).error("readOne"),
      `Error data set to state equals error data the action promise resolves to`
    )

    t.deepEquals(
      {
        body: error.body,
        status: error.status,
      },
      {
        body: { message: "resource not found" },
        status: 404,
      },
      `Resolved error data same as slide data`
    )
  }

  try {
    await todos.readOne()
  } catch (error) {
    t.equals(
      error.message,
      `JustAList: "READ-ONE-ERROR_TODOS".readOne ID param missing. Expected something, got "undefined"`
    )
  }

  {
    const { error } = await todos.readOne(1, {
      description: "updated item",
    })

    t.equals(
      todos.selector(store.getState()).error("readOne"),
      undefined,
      "State error is set to null after successfull readOne"
    )

    t.equals(
      error,
      undefined,
      "Resolved error is null after successfull readOne"
    )
  }
})
