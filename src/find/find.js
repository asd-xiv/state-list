const debug = require("debug")("ReduxAllIsList:Find")

import { is } from "@asd14/m"
import { buildQueue } from "../../lib/queue"

const actionQueuesByCollectionName = {}

/**
 * Call API to fetch items, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  api              API method
 * @param  {string}    actionStartName  Action dispatched before API call
 * @param  {string}    actionEndName    Action dispatched after API call
 *
 * @returns {Object[]}
 */
export const findAction = ({
  name,
  dispatch,
  method,
  actionStart,
  actionEnd,
}) => (...args) => {
  const actionsQueue = is(actionQueuesByCollectionName[name])
    ? actionQueuesByCollectionName[name]
    : (actionQueuesByCollectionName[name] = buildQueue())

  return actionsQueue.enqueue(args, {
    job: method,
    before: () => {
      dispatch({
        type: actionStart,
      })
    },
    onSuccess: results => {
      dispatch({
        type: actionEnd,
        payload: {
          items: Array.isArray(results) ? results : [results],
        },
      })

      return results
    },
    onError: error => {
      //
      console.log("ERROR", error)
    },
  })
}

/**
 * Modify state to indicate the list is being loaded
 *
 * @param {Object}  state  Old state
 *
 * @return {Object} New state
 */
export const findStartReducer = state => ({
  ...state,
  isLoading: true,
})

/**
 * Add newly received items
 *
 * @param {Object}    state  Old state
 * @param {Object[]}  items  List of items
 *
 * @return {Object} New state
 */
export const findEndReducer = (state, { items }) => ({
  ...state,
  items,
  loadDate: new Date(),
  isLoading: false,
})
