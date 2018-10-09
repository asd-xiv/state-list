const debug = require("debug")("ReduxAllIsList:DeleteReducers")

import { has, remove, filterBy } from "@codemachiner/m"

/**
 * Enable UI flag for removing item
 *
 * @param  {Object}  state    The state
 * @param  {Object}  arg2     Payload
 * @param  {Object}  arg2.id  Item id
 *
 * @return {Object}
 */
export const deleteStart = (state, { id }) => {
  const isDeleting = has(id)(state.itemsDeletingIds)

  isDeleting &&
    debug(
      "listDeleteStart: ID already deleting ... doing nothing (will still trigger a rerender)",
      {
        id,
        itemsDeletingIds: state.itemsDeletingIds,
      }
    )

  return {
    ...state,
    itemsDeletingIds: isDeleting
      ? state.itemsDeletingIds
      : [...state.itemsDeletingIds, id],
  }
}

/**
 * Remove item from items array
 *
 * @param  {Object}  state    The state
 * @param  {Object}  arg2     Payload
 * @param  {Object}  arg2.id  Item id
 *
 * @return {Object}
 */
export const deleteEnd = (state, { id }) => ({
  ...state,
  itemsDeletingIds: remove(id)(state.itemsDeletingIds),
  items: filterBy({ "!id": id })(state.items),
})
