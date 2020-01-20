const debug = require("debug")("ReduxList:useList")

import { useListSelector } from "./use-list-selector"

/**
 * Custom hook for easy interfacing Redux List
 *
 * @param {Object}   list     Any Redux List object
 * @param {Function} dispatch Redux dispatch
 *
 * @returns {{selector, create, read, readOne, update, remove, clear}}
 */
const useList = (list, dispatch) => ({
  selector: useListSelector(list.name),
  create: (...args) => list.create(dispatch, ...args),
  read: (...args) => list.read(dispatch, ...args),
  readOne: (...args) => list.readOne(dispatch, ...args),
  update: (...args) => list.update(dispatch, ...args),
  remove: (...args) => list.remove(dispatch, ...args),
  clear: (...args) => list.clear(dispatch, ...args),
})

export { useList }
