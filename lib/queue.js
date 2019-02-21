import { i, findBy, tail, deepEqual, is, isEmpty } from "@asd14/m"

export const buildQueue = () => {
  const jobsList = []
  let isProcessing = false

  return {
    enqueue(args, { job, before = i, onSuccess, onError }) {
      const existingItem = findBy({ args: deepEqual(args) })(jobsList)

      if (is(existingItem)) {
        return existingItem.jobPromise
      }

      let deferredResolve = null
      let deferredReject = null

      const newItem = {
        args,
        job,
        before,
        onResolve: results => {
          deferredResolve(onSuccess(results))
        },
        onReject: error => {
          deferredReject(onError(error))
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
        const runningJob = tail(jobsList)

        isProcessing = true
        runningJob.before()

        Promise.resolve(runningJob.job(runningJob.args))
          .then(result => {
            runningJob.onResolve(result)
          })
          .catch(error => {
            runningJob.onError(error)
          })
          .finally(() => {
            jobsList.pop()

            if (isEmpty(jobsList)) {
              isProcessing = false
            } else {
              // - api call ended, process next item in line
              // - "this" refers to the object returned by buildQueue
              this.dequeue()
            }
          })
      }
    },
  }
}
