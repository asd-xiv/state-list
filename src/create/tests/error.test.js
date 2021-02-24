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

test("Create - error", async t => {
  // WHAT TO TEST
  const todos = buildList({
    name: "CREATE-ERROR_TODOS",
    read: () => [],
    create: ({ id, name }) => {
      return name === "throw"
        ? Promise.reject(
            new RequestError("Something something API crash", {
              body: { validationData: "from server" },
              status: 409,
            })
          )
        : Promise.resolve({ id, name })
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
    const { error: apiError } = await todos.create({ id: 1, name: "throw" })
    const createError = todos.selector(store.getState()).error("create")

    t.deepEquals(
      apiError,
      createError,
      `Error data set to state equals error data the action promise resolves to`
    )

    t.deepEquals(
      {
        body: createError.body,
        status: createError.status,
      },
      {
        body: { validationData: "from server" },
        status: 409,
      },
      `Resolved error data same as slide data`
    )
  }

  {
    const { error } = await todos.create({
      id: 2,
      name: "dont throw",
    })
    const createError = todos.selector(store.getState()).error("create")

    t.equals(
      createError,
      undefined,
      "State error is set to null after successfull create"
    )

    t.equals(
      error,
      undefined,
      "Resolved error is null after successfull create"
    )
  }

  {
    const { error } = await todos.create({ name: "dont throw" })

    t.equals(
      error.message,
      `JustAList: "CREATE-ERROR_TODOS" Trying to create item without id property`,
      "Creating item without id field should throw"
    )
  }

  {
    await todos.create({ id: 2, name: "bar" })

    const { items } = todos.selector(store.getState())

    t.deepEquals(
      items(),
      [{ id: 2, name: "bar" }],
      "Items matching by id are merged"
    )
  }

  t.end()
})
