const debug = require("debug")("ReduxAllIsList:UpdateReducers")

import { filterBy, merge, hasWith } from "@codemachiner/m"

/**
 * Enable update UI flag
 *
 * @param  {Object}  state  Current state
 *
 * @return {Object}
 */
export const updateStart = (state, { id, data }) => {
  const isUpdating = hasWith({ id })(state.itemsUpdating)

  isUpdating &&
    debug(
      "updateStart: ID already updating ... doing nothing (will still trigger a rerender)",
      {
        id,
        itemsUpdating: state.itemsUpdating,
      }
    )

  return {
    ...state,
    itemsUpdating: isUpdating
      ? state.itemsUpdating
      : [...state.itemsUpdating, { id, data }],
  }
}

/**
 * Update item in the list
 *
 * @param {Object}  state        Current state
 * @param {Object}  arg2         Payload
 * @param {Object}  arg2.update  API response
 *
 * @return {Object}
 */
export const updateEnd = (state, { item }) => ({
  ...state,
  items: state.items.map(
    itemsMapElm =>
      itemsMapElm.id === item.id ? merge(itemsMapElm, item) : itemsMapElm
  ),
  itemsUpdating: filterBy({ "!id": item.id })(state.itemsUpdating),
})
