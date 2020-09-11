const debug = require("debug")("JustAList:CreateReducers")

import { hasWith, intersect, not, is, i } from "m.xyz"

export const startReducer = (state, { items }) => ({
  ...state,
  creating: items,
})

export const endReducer = (state, { listName, items = [], onChange = i }) => {
  const itemWithoutId = hasWith({
    id: not(is),
  })(items)

  if (itemWithoutId) {
    throw new TypeError(
      `JustAList: "${listName}" Trying to create item without id property`
    )
  }

  return {
    ...state,
    items: onChange(
      intersect(
        (a, b) => a.id === b.id,
        (a, b) => ({ ...a, ...b })
      )(state.items, items)
    ),

    // reset error after successfull action
    errors: {
      ...state.errors,
      create: null,
    },
    creating: [],
  }
}

export const errorReducer = (state, error) => ({
  ...state,
  errors: {
    ...state.errors,
    create: error,
  },
  creating: [],
})
