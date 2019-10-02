const debug = require("debug")("ReduxList:useListSelector")

import {
  pipe,
  get,
  findWith,
  isEmpty,
  sortWith,
  head,
  is,
  hasWith,
} from "@mutantlove/m"

const useListSelector = namespace => state => ({
  head: () =>
    pipe(
      get([namespace, "items"]),
      head
    )(state),
  byId: id =>
    pipe(
      get([namespace, "items"]),
      findWith({ id })
    )(state),
  items: () => get([namespace, "items"])(state),
  creating: () => get([namespace, "creating"])(state),
  updating: () => get([namespace, "updating"])(state),
  removing: () => get([namespace, "removing"])(state),
  allErrors: () => get([namespace, "errors"])(state),
  error: action =>
    isEmpty(action)
      ? pipe(
          get([namespace, "errors"], {}),
          Object.values,
          sortWith("date"),
          head
        )(state)
      : get([namespace, "errors", action])(state),
  isCreating: () =>
    pipe(
      get([namespace, "creating"]),
      items => !isEmpty(items)
    )(state),
  isRemoving: id => {
    const removing = get([namespace, "removing"])(state)

    return is(id) ? hasWith({ id })(removing) : !isEmpty(removing)
  },
  isUpdating: id => {
    const updating = get([namespace, "updating"])(state)

    return is(id) ? hasWith({ id })(updating) : !isEmpty(updating)
  },
  isLoading: () => get([namespace, "isLoading"])(state),
  isLoaded: () =>
    pipe(
      get([namespace, "loadDate"]),
      is
    )(state),
})

export { useListSelector }
