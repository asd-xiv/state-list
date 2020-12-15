const debug = require("debug")("JustAList:CreateReducers")

import { hasWith, intersect, not, is, i } from "@asd14/m"

export const startReducer = (state, { items }) => ({
  ...state,
  items_creating: items,
})

export const endReducer = (state, { listName, items, onChange = i }) => {
  if (hasWith({ id: not(is) }, items)) {
    throw new TypeError(
      `JustAList: "${listName}" Trying to create item without id property`
    )
  }

  return {
    ...state,
    items: onChange(
      intersect(
        (a, b) => a.id === b.id,
        (a, b) => ({ ...a, ...b }),
        state.items,
        items
      )
    ),

    items_creating: [],

    // reset error after successfull action
    errors: {
      ...state.errors,
      create: null,
    },
  }
}

export const errorReducer = (state, error) => ({
  ...state,
  errors: {
    ...state.errors,
    create: error,
  },
  items_creating: [],
})
