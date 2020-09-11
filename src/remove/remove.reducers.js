const debug = require("debug")("JustAList:RemoveReducers")

import { findWith, hasWith, removeWith, i, isEmpty } from "m.xyz"

export const startReducer = (state, { id, isOptimist }) => {
  if (!isEmpty(state.removing)) {
    debug(
      `JustAList: "${state.listName}".remove has already been called, use .isRemoving() selector to know if an item is getting removed.`
    )
  }

  if (!hasWith({ id }, state.items)) {
    throw new TypeError(
      `JustAList: "${state.listName}".remove ID "${id}" does not exist`
    )
  }

  const item = findWith({ id }, {}, state.items)

  return {
    ...state,
    items: isOptimist ? removeWith({ id }, state.items) : state.items,
    optimistItems: isOptimist
      ? [...state.optimistItems, item]
      : state.optimistItems,
    removing: [...state.removing, item],
  }
}

export const endReducer = (state, { id, onChange = i }) => {
  return {
    ...state,
    items: onChange(removeWith({ id }, state.items)),
    optimistItems: removeWith({ id }, state.optimistItems),
    removing: removeWith({ id }, state.removing),
    errors: {
      ...state.errors,
      remove: null,
    },
  }
}

export const errorReducer = (state, { id, error, isOptimist }) => {
  const prevItem = findWith({ id }, {}, state.optimistItems)

  return {
    ...state,
    items: isOptimist ? [...state.items, prevItem] : state.items,
    optimistItems: isOptimist
      ? removeWith({ id }, state.optimistItems)
      : state.optimistItems,
    removing: removeWith({ id }, state.removing),
    errors: {
      ...state.errors,
      remove: error,
    },
  }
}
