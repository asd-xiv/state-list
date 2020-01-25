const debug = require("debug")("ReduxList:CreateReducers")

import {
  pipe,
  findWith,
  isNothing,
  reduce,
  hasWith,
  when,
  push,
  is,
  i,
} from "@mutantlove/m"

export const startReducer = (state, { items } = {}) => ({
  ...state,
  creating: items,
})

export const endReducer = (
  state,
  { listName, items = [], onChange = i } = {}
) => {
  const itemWithoutId = findWith({
    id: isNothing,
  })(items)

  if (is(itemWithoutId)) {
    throw new TypeError(
      `ReduxList: "${listName}" Trying to create item without id property`
    )
  }

  return {
    ...state,
    items: pipe(
      reduce((acc = state.items, item) =>
        when(
          hasWith({ id: item.id }),
          () => {
            throw new TypeError(
              `ReduxList: "${listName}".create ID "${item.id}" already exists`
            )
          },
          push(item)
        )(acc)
      ),
      onChange
    )(items),

    // reset error after successfull action
    errors: {
      ...state.errors,
      create: null,
    },
    creating: [],
  }
}

export const errorReducer = (state, error = {}) => ({
  ...state,
  errors: {
    ...state.errors,
    create: error,
  },
  creating: [],
})
