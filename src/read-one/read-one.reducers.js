const debug = require("debug")("JustAList:ReadOneReducers")

import { intersect, merge, i } from "@asd14/m"

export const startReducer = (state, id) => {
  if (state.isLoadingOne) {
    debug(
      `JustAList: "${state.listName}".readOne has already been called, use .isLoadingOne() selector to know if list is already loading.`
    )
  }

  return {
    ...state,
    reading: id,
  }
}

export const endReducer = (state, { item, onChange = i }) => ({
  ...state,

  items: onChange(
    intersect((a, b) => a.id === b.id, merge)(state.items, [item])
  ),

  // reset error after successfull action
  errors: {
    ...state.errors,
    readOne: undefined,
  },
  reading: undefined,
})

export const errorReducer = (state, error) => ({
  ...state,
  errors: {
    ...state.errors,
    readOne: error,
  },
  reading: undefined,
})
