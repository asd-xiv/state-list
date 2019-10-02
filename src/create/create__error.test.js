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
  const todos = buildList("CREATE-ERROR_TODOS", {
    read: () => [],
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
    const { error: apiError } = await create({ name: "throw" })
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
    const { error: apiError } = await create({ name: "dont throw" })
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

  t.end()
})
