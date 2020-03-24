const debug = require("debug")("ReduxList:ReadOneReducers")

import { pipe, map, push, merge, when, hasWith, i } from "@mutant-ws/m"

export const startReducer = (state, id) => ({
  ...state,
  reading: id,
})

export const endReducer = (state, { item, onChange = i }) => ({
  ...state,
  items: pipe(
    when(
      hasWith({ id: item.id }),
      map(mapItem => (mapItem.id === item.id ? merge(mapItem, item) : mapItem)),
      push(item)
    ),
    onChange
  )(state.items),

  // reset error after successfull action
  errors: {
    ...state.errors,
    readOne: null,
  },
  reading: null,
})

export const errorReducer = (state, error) => ({
  ...state,
  errors: {
    ...state.errors,
    readOne: error,
  },
  reading: null,
})
