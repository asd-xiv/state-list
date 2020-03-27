import test from "tape"
import { createStore, combineReducers } from "redux"

import { buildList } from "."

test("List with web socket connection", t => {
  t.plan(6)

  let listChanges = 0

  // List to test
  const todos = buildList({
    name: "TODOS-REAL-TIME",

    create: data => data,
    read: () => [{ id: 0 }, { id: 1 }],
    readOne: (id, data) => ({ id, ...data }),
    update: (id, data) => ({ id, ...data }),
    remove: data => data,

    // track how many times
    onChange: items => {
      listChanges += 1

      return items
    },
  })

  // Redux store
  const store = createStore(
    combineReducers({
      [todos.name]: todos.reducer,
    })
  )

  todos.setDispatch(store.dispatch)

  // Socket server
  const server = require("http").createServer()
  const io = require("socket.io")({
    serveClient: false,
  })

  // use random free port
  server.listen(0)

  // attach websocket to running http server
  io.attach(server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
  })

  // after server started listening
  server.on("listening", () => {
    // connect Todos list to websocket
    todos.socketConnect({
      url: `http://localhost:${server.address().port}`,
      namespace: "todos",
      events: ["create", "update"],
      onData: async (event, data) => {
        if (event === "create") {
          return t.deepEquals(
            data,
            { lorem: "ipsum" },
            "List receives data from multiple events"
          )
        }

        t.deepEquals(
          { event, data },
          { event: "update", data: { foo: "bar" } },
          "Receive async server data after subscribing to websocket with namespaced event"
        )

        {
          const results = [
            // [{id: 0},{ id: 1 }, { id: 2 }, { id: 3 }]
            await todos.create([{ id: 2 }, { id: 3 }]),

            // [{ id: 1 }, { id: 2 }, { id: 3, lorem: "ipsum" }]
            await todos.remove(0),

            // [{ id: 1 }, { id: 2, foo: "bar" }, { id: 3, lorem: "ipsum" }]
            await todos.update(2, { foo: "bar" }),
          ]

          const { items } = todos.selector(store.getState())

          t.deepEquals(
            results,
            [
              { result: [{ id: 2 }, { id: 3 }] },
              { result: 0 },
              { result: { id: 2, foo: "bar" } },
            ],
            "Calling CRUD methods without isLocal = true resolves method result the same way as without websocket connection"
          )

          t.deepEquals(
            { items: items(), listChanges },
            { items: [], listChanges: 0 },
            "Calling create/update/remove methods without isLocal = true will not trigger state update"
          )
        }

        {
          // [{id: 0},{ id: 1 }]
          await todos.read()

          // [{id: 0},{ id: 1 }, { id: 2 }, { id: 3 }]
          await todos.create([{ id: 2 }, { id: 3 }], { isLocal: true })

          // [{ id: 1 }, { id: 2 }, { id: 3, lorem: "ipsum" }]
          await todos.remove(0, { isLocal: true })

          // [{ id: 1 }, { id: 2, foo: "bar" }, { id: 3, lorem: "ipsum" }]
          await todos.update(2, { foo: "bar" }, { isLocal: true })

          const { items } = todos.selector(store.getState())

          t.deepEquals(
            { items: items(), listChanges },
            {
              items: [{ id: 1 }, { id: 2, foo: "bar" }, { id: 3 }],
              listChanges: 4,
            },
            "Calling create/update/remove methods with isLocal = true will trigger state update"
          )
        }

        // close Todos list websocket connection
        todos.socketDisconnect()
      },
    })
  })

  // setup websocket server to emit "ping" event on "/tape" namespace
  const namespace = io.of("/todos")

  namespace.on("connection", userSocket => {
    namespace.emit("create", {
      lorem: "ipsum",
    })

    namespace.emit("update", {
      foo: "bar",
    })

    // should trigger when list calls "socketDisconnect"
    userSocket.on("disconnect", () => {
      t.pass("List successfully disconnected")

      server.close()
    })
  })
})
