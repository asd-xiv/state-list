const debug = require("debug")("JustAList:UpdateReducers")

import {
  intersect,
  merge,
  hasWith,
  findWith,
  removeWith,
  replaceWith,
  push,
  i,
  isEmpty,
} from "@asd14/m"

export const startReducer = (
  state,
  { id, data, isOptimist = false, onMerge = merge, onChange = i }
) => {
  if (!isEmpty(state.updating)) {
    debug(
      `JustAList: "${state.listName}".update has already been called, use .isUpdating() selector to know if an item is updating.`
    )
  }

  if (!hasWith({ id }, state.items)) {
    throw new TypeError(
      `JustAList: "${state.listName}".update ID "${id}" does not exist`
    )
  }

  const item = findWith({ id }, {}, state.items)

  return {
    ...state,
    items: isOptimist
      ? onChange(
          intersect((a, b) => a.id === b.id, onMerge)(state.items, [
            { id, ...data },
          ])
        )
      : state.items,
    optimistItems: intersect(
      (a, b) => a.id === b.id,
      merge
    )(state.optimistItems, [item]),
    updating: push({ id, data })(state.updating),
  }
}

export const endReducer = (state, { item, onMerge = merge, onChange = i }) => {
  return {
    ...state,
    items: onChange(
      intersect((a, b) => a.id === b.id, onMerge)(state.items, [item])
    ),
    optimistItems: removeWith({ id: item.id }, state.optimistItems),
    updating: removeWith({ id: item.id }, state.updating),
    errors: {
      ...state.errors,
      update: undefined,
    },
  }
}

export const errorReducer = (state, { id, error, isOptimist }) => {
  const previousItem = findWith({ id }, {}, state.optimistItems)

  return {
    ...state,
    items: isOptimist
      ? replaceWith({ id }, previousItem)(state.items)
      : state.items,
    optimistItems: isOptimist
      ? removeWith({ id }, state.optimistItems)
      : state.optimistItems,
    updating: removeWith({ id }, state.updating),
    errors: {
      ...state.errors,
      update: error,
    },
  }
}
