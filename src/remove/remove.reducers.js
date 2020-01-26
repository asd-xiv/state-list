const debug = require("debug")("ReduxList:RemoveReducers")

import { pipe, filterWith, findWith, hasWith, i } from "@mutantlove/m"

export const startReducer = (state, id) => ({
  ...state,
  removing: [findWith({ id })(state.items)],
})

export const endReducer = (
  state,
  { listName, item: { id } = {}, onChange = i }
) => {
  if (!hasWith({ id })(state.items)) {
    throw new TypeError(
      `ReduxList: "${listName}".remove ID "${id}" does not exist`
    )
  }

  return {
    ...state,
    items: pipe(filterWith({ "!id": id }), onChange)(state.items),

    // reset error after successfull action
    errors: {
      ...state.errors,
      remove: null,
    },
    removing: [],
  }
}

export const errorReducer = (state, error) => ({
  ...state,
  errors: {
    ...state.errors,
    remove: error,
  },
  removing: [],
})
