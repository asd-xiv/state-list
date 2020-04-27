const debug = require("debug")("ReduxList:UpdateReducers")

import { intersect, i, is } from "@mutant-ws/m"

export const startReducer = (state, { id, data }) => ({
  ...state,
  updating: [{ id, data }],
})

export const endReducer = (state, { item, onMerge, onChange = i }) => {
  return {
    ...state,
    items: onChange(
      intersect(
        (a, b) => a.id === b.id,
        is(onMerge) ? onMerge : (a, b) => ({ ...a, ...b })
      )(state.items, [item])
    ),

    // reset error after successfull action
    errors: {
      ...state.errors,
      update: null,
    },
    updating: [],
  }
}

export const errorReducer = (state, error) => ({
  ...state,
  updating: [],
  errors: {
    ...state.errors,
    update: error,
  },
})
