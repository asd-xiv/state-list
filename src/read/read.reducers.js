const debug = require("debug")("JustAList:ReadReducers")

import { intersect, i, merge } from "@asd14/m"

export const startReducer = state => {
  if (state.isLoading) {
    debug(
      `JustAList: "${state.listName}".read has already been called, use .isLoading() selector to know if list is already loading.`
    )
  }

  return {
    ...state,
    isLoading: true,
  }
}

export const endReducer = (
  state,
  { items = [], shouldClear, onChange = i }
) => ({
  ...state,
  items: onChange(
    shouldClear
      ? items
      : intersect((a, b) => a.id === b.id, merge)(state.items, items)
  ),

  // reset error after successfull action
  errors: {
    ...state.errors,
    read: null,
  },
  loadDate: new Date(),
  isLoading: false,
})

export const errorReducer = (state, error) => ({
  ...state,
  errors: {
    ...state.errors,
    read: error,
  },
  items: [],
  isLoading: false,
})
