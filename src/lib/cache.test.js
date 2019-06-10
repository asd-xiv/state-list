import test from "tape"

import { buildCacheStore } from "./cache"

test("Cache store - String and Object key based cache store", t => {
  const cache = buildCacheStore()

  t.equals(
    cache.get("lorem"),
    undefined,
    "String key does not exist, returns undefined"
  )

  cache.set("lorem", { foo: "bar" })

  t.deepEquals(
    cache.get("lorem"),
    {
      foo: "bar",
    },
    "String key exists and did not expire, returns stored value"
  )

  t.equals(
    cache.get({ args: "lorem" }),
    undefined,
    "Object key does not exist returns, undefined"
  )

  cache.set({ args: "lorem" }, "42")

  t.equals(
    cache.get({ args: "lorem" }),
    "42",
    "Object key exists and did not expire, returns stored value"
  )

  cache.set("foo", "bar", { ttl: 100 })

  setTimeout(() => {
    t.equal(
      cache.get("foo"),
      undefined,
      "Key exists but expired, returns undefined"
    )
    t.end()
  }, 150)
})
