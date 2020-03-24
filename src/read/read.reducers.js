const debug = require("debug")("ReduxList:ReadReducers")

import {
  pipe,
  push,
  hasWith,
  reduce,
  when,
  merge,
  map,
  i,
  same,
} from "@mutant-ws/m"

export const startReducer = state => ({
  ...state,
  isLoading: true,
})

export const endReducer = (
  state,
  { items = [], shouldClear, onChange = i }
) => ({
  ...state,
  items: pipe(
    when(
      () => shouldClear === true,
      same(items),
      reduce((acc = state.items, accItem) =>
        when(
          hasWith({ id: accItem.id }),
          map(mapItem =>
            mapItem.id === accItem.id ? merge(mapItem, accItem) : mapItem
          ),
          push(accItem)
        )(acc)
      )
    ),
    onChange
  )(items),

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
