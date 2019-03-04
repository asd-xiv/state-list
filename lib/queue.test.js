/* eslint-disable no-loop-func */
import test from "tape"
import { map } from "@asd14/m"

import { buildQueue } from "./queue"

test("Promise Queue - Promise based unique elements queue", t => {
  const queue = buildQueue()

  let findCountBatch1 = 0
  let findDateBatch1 = null
  let findCountBatch2 = 0
  let findDateBatch2 = null

  const jobs = [
    // add job with same arguments
    ...map(() =>
      queue.enqueue(
        () => {
          findCountBatch1++
          findDateBatch1 = new Date()

          return new Promise(resolve => {
            setTimeout(() => {
              resolve([{ id: 1, name: "test" }])
            }, 100)
          })
        },
        {
          args: [
            {
              path: "/todos",
              query: { limit: 10 },
            },
          ],
        }
      )
    )([1, 2, 3, 4, 5]),
    // add job with different arguments
    ...map(() =>
      queue.enqueue(
        () => {
          findCountBatch2++
          findDateBatch2 = new Date()

          return new Promise(resolve => {
            setTimeout(() => {
              resolve([{ id: 1, name: "test" }])
            }, 100)
          })
        },
        {
          args: [
            {
              path: "/todos",
              query: { limit: 20 },
            },
          ],
        }
      )
    )([1, 2, 3, 4, 5]),
  ]

  Promise.all(jobs).then(() => {
    t.equals(
      findCountBatch1 === 1 && findCountBatch2 === 1,
      true,
      "Same signature jobs enqueued at the same times should run once"
    )

    t.equals(
      findDateBatch1 < findDateBatch2,
      true,
      "Different signature jobs should run sequentially"
    )

    t.end()
  })
})
