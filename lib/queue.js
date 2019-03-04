import { findBy, tail, deepEqual, is, isEmpty } from "@asd14/m"

/**
 * Unieq, sequential, promise based job queue
 *
 * @example
 * const queue = buildQueue()
 *
 * queue.enqueue(Users.login, {
 *  args:{
 *    body: {email: "lorem@test.com", password: "secret"}
 *  }
 * })
 *   .then(...)
 *   .catch(...)
 *
 * @return {Object}
 */
export const buildQueue = () => {
  const jobsList = []
  let isProcessing = false

  return {
    enqueue(job, { args /* shouldCancelOthers = false */ }) {
      const existingItem = findBy({ args: deepEqual(args) })(jobsList)

      if (is(existingItem)) {
        return existingItem.jobPromise
      }

      let deferredResolve = null
      let deferredReject = null

      const newItem = {
        args,
        job,
        onResolve: results => {
          deferredResolve(results)
        },
        onReject: error => {
          deferredReject(error)
        },
        jobPromise: new Promise((resolve, reject) => {
          deferredResolve = resolve
          deferredReject = reject
        }),
      }

      jobsList.unshift(newItem)
      this.dequeue()

      return newItem.jobPromise
    },

    dequeue() {
      const shouldPop = !isProcessing && !isEmpty(jobsList)

      if (shouldPop) {
        const job = tail(jobsList)

        isProcessing = true

        Promise.resolve(job.job(...job.args))
          .then(job.onResolve)
          .catch(job.onReject)
          .finally(() => {
            // process next in queue
            isProcessing = false
            jobsList.pop()
            this.dequeue()
          })
      }
    },
  }
}
