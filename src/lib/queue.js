import { findWith, last, is, isEmpty } from "@mutant-ws/m"
import isDeepEqual from "fast-deep-equal"

/**
 * Unique, sequential, promise based queue
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
 * @return {Object<enqueue, dequeue>}
 */
export const buildQueue = () => {
  const jobsList = []
  let isProcessing = false

  return {
    enqueue({ id, fn, args }) {
      const runningJob = findWith({
        id,
        args: source => isDeepEqual(source, args),
      })(jobsList)

      if (is(runningJob)) {
        return runningJob.fnPromise
      }

      let deferredResolve = null
      let deferredReject = null
      const fnResultPromise = new Promise((resolve, reject) => {
        deferredResolve = resolve
        deferredReject = reject
      })

      // add job at begining of queue
      jobsList.unshift({
        id,
        args,
        fn,
        fnResultPromise,
        onResolve: results => {
          deferredResolve(results)
        },
        onReject: error => {
          deferredReject(error)
        },
      })

      // start processing jobs
      this.dequeue()

      // return promise that will be resolved after fn is called and resolved
      return fnResultPromise
    },

    dequeue() {
      const shouldStartRunningJobs = !isProcessing && !isEmpty(jobsList)

      if (!shouldStartRunningJobs) {
        return undefined
      }

      const { fn, args, onResolve, onReject } = last(jobsList)

      // no jobs will be started until current one finishes
      isProcessing = true

      return Promise.resolve()
        .then(() => {
          // Need to remove ourselves before job.fn resolves. If another
          // action of the same signature runs right after it will return this
          // job because job still exists in queue
          jobsList.pop()

          return fn(...args)
        })
        .then(onResolve)
        .catch(onReject)
        .finally(() => {
          // process next in queue
          isProcessing = false
          this.dequeue()
        })
    },
  }
}
