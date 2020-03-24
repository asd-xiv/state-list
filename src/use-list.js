const debug = require("debug")("ReduxList:useList")

import { pipe, get, hasWith, findWith, isNotEmpty, is } from "@mutant-ws/m"

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
    selector: state => ({
      head: () => get([list.name, "items", 0])(state),

      byId: (id, notFoundDefault) =>
        pipe(
          get([list.name, "items"]),
          findWith({ id }, notFoundDefault)
        )(state),

      items: () => get([list.name, "items"])(state),
      creating: () => get([list.name, "creating"])(state),
      updating: () => get([list.name, "updating"])(state),
      removing: () => get([list.name, "removing"])(state),
      error: action => get([list.name, "errors", action])(state),

      hasWithId: id => pipe(get([list.name, "items"]), hasWith({ id }))(state),
      isCreating: () => pipe(get([list.name, "creating"]), isNotEmpty)(state),
      isRemoving: id => {
        const removing = get([list.name, "removing"])(state)

        return is(id) ? hasWith({ id })(removing) : isNotEmpty(removing)
      },
      isUpdating: id => {
        const updating = get([list.name, "updating"])(state)

        return is(id) ? hasWith({ id })(updating) : isNotEmpty(updating)
      },
      isLoading: () => get([list.name, "isLoading"])(state),
      isLoaded: () => pipe(get([list.name, "loadDate"]), is)(state),
    }),

    create: list.create,
    read: list.read,
    readOne: list.readOne,
    update: list.update,
    remove: list.remove,
    clear: list.clear,
  }
}

export { useList }
