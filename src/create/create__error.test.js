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

  const { selector, create, read } = useList(todos, store.dispatch)

  await read()

  {
    const { error: apiError } = await create({ id: 1, name: "throw" })
    const createError = selector(store.getState()).error("create")

    t.deepEquals(
      apiError,
      createError,
      `Error data set to state equals error data the action promise resolves to`
    )

    t.deepEquals(
      {
        body: createError.data.body,
        status: createError.data.status,
      },
      {
        body: { validationData: "from server" },
        status: 409,
      },
      `Resolved error data same as slide data`
    )
  }

  {
    const { error: apiError } = await create({ id: 2, name: "dont throw" })
    const createError = selector(store.getState()).error("create")

    t.equals(
      createError,
      null,
      "State error is set to null after successfull create"
    )

    t.equals(
      apiError,
      undefined,
      "Resolved error is null after successfull create"
    )
  }

  {
    const { error } = await create({ name: "dont throw" })

    t.equals(
      error.data.message,
      `ReduxList: "CREATE-ERROR_TODOS" Trying to create item without id property`,
      "Creating item without id field should throw"
    )
  }

  {
    const { error } = await create({ id: 2, name: "dont throw" })

    t.equals(
      error.data.message,
      `ReduxList: "CREATE-ERROR_TODOS".create ID "2" already exists`,
      "Creating item with same id should throw"
    )
  }

  t.end()
})
