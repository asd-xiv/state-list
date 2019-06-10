import { findWith, last, deepEqual, is, isEmpty } from "@asd14/m"

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
    enqueue({ fn, args }) {
      const runningJob = findWith({
        args: deepEqual(args),
        fnString: fn.toString(),
      })(jobsList)

      if (is(runningJob)) {
        return runningJob.fnPromise
      }

      let deferredResolve = null,
        deferredReject = null

      const newJob = {
        args,
        fn,
        fnString: fn.toString(),
        fnPromise: new Promise((resolve, reject) => {
          deferredResolve = resolve
          deferredReject = reject
        }),
        onResolve: results => {
          deferredResolve(results)
        },
        onReject: error => {
          deferredReject(error)
        },
      }

      jobsList.unshift(newJob)
      this.dequeue()

      return newJob.fnPromise
    },

    dequeue() {
      const shouldPop = !isProcessing && !isEmpty(jobsList)

      if (shouldPop) {
        const job = last(jobsList)

        isProcessing = true

        Promise.resolve()
          // run job inside promise chain so it gets into catch
          .then(() => job.fn(...job.args))
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
