import test from "tape"

import { buildQueue } from "./queue"

test("PQueue - Promise based unique elements queue", t => {
  const jobs = buildQueue()
  let findCount = 0

  // think API call's path + querry params
  // think API call
  const apiJob = {
    job: () => {
      findCount++

      return new Promise(resolve => {
        setTimeout(() => {
          resolve([{ id: 1, name: "test" }])
        }, 100)
      })
    },
  }

  jobs.enqueue(
    {
      path: "/todos",
      query: { limit: 10 },
    },
    apiJob
  )
  jobs.enqueue(
    {
      path: "/todos",
      query: { limit: 10 },
    },
    apiJob
  )

  t.equals(
    findCount,
    1,
    "Same id jobs enqueued at the same time should only trigger the action of the first one added"
  )

  t.end()
})
