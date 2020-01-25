const debug = require("debug")("ReduxList:UpdateReducers")

import { map, pipe, merge, hasWith, i } from "@mutantlove/m"

export const startReducer = (state, { id, data }) => ({
  ...state,
  updating: [{ id, data }],
})

export const endReducer = (state, { listName, item, onChange = i } = {}) => {
  if (!hasWith({ id: item.id })(state.items)) {
    throw new TypeError(
      `ReduxList: "${listName}".update ID "${item.id}" does not exist`
    )
  }

  return {
    ...state,
    items: pipe(
      map(mapItem => (mapItem.id === item.id ? merge(mapItem, item) : mapItem)),
      onChange
    )(state.items),

    // reset error after successfull action
    errors: {
      ...state.errors,
      update: null,
    },
    updating: [],
  }
}

export const errorReducer = (state, error = {}) => ({
  ...state,
  updating: [],
  errors: {
    ...state.errors,
    update: error,
  },
})
