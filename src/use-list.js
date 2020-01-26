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
const useList = (list, dispatch) => {
  list.setDispatch(dispatch)

  return {
    selector: useListSelector(list.name),
    create: list.create,
    read: list.read,
    readOne: list.readOne,
    update: list.update,
    remove: list.remove,
    clear: list.clear,
  }
}

export { useList }
