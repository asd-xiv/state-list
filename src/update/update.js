const debug = require("debug")("ReduxCollections:Update")

import { map, filterBy, merge, hasWith, is } from "@leeruniek/functies"

/**
 * Call API to update an item, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  api              API method
 * @param  {string}    actionStartName  Action dispatched before API call
 * @param  {string}    actionEndName    Action dispatched after API call
 *
 * @return {Promise<Object>}
 */
export const updateAction = ({
  cache,
  dispatch,
  api,
  actionStart,
  actionEnd,
}) => (id, data) => {
  dispatch({
    type: actionStart,
    payload: {
      id,
      data,
    },
  })

  return Promise.resolve(api(id, data)).then(itemUpdated => {
    is(cache) && cache.clear()

    dispatch({
      type: actionEnd,
      payload: itemUpdated,
    })

    return itemUpdated
  })
}

/**
 * Modify state to indicate one item in list is being updated
 *
 * @param  {Object}         state  Old state
 * @param  {number|string}  id     Updating item ID
 * @param  {Object}         data   Updating item data
 *
 * @return {Object} New state
 */
export const updateStartReducer = (state, { id, data }) => {
  const isAlreadyUpdating = hasWith({ id })(state.updating)

  isAlreadyUpdating &&
    debug(
      "updateStartReducer: ID already updating, doing nothing (will still trigger a rerender)",
      {
        id,
        updating: state.updating,
      }
    )

  return {
    ...state,
    updating: isAlreadyUpdating
      ? state.updating
      : [...state.updating, { id, data }],
  }
}

/**
 * Add newly created item to list
 *
 * @param {Object}  state        Current state
 * @param {Object}  itemUpdated  API response with item data
 *
 * @return {Object}
 */
export const updateEndReducer = (state, itemUpdated) => {
  const hasId = Object.prototype.hasOwnProperty.call(itemUpdated, "id")

  if (!hasId) {
    throw new TypeError(
      `deleteSuccessReducer: cannot update item "${itemUpdated}" without id property`
    )
  }

  const exists = hasWith({ id: itemUpdated.id })(state.items)

  if (!exists) {
    debug(
      `updateSuccessReducer: ID "${
        itemUpdated.id
      }" does not exist, doint nothing (will still trigger a rerender)`,
      {
        itemUpdated,
        existingItems: state.items,
      }
    )
  }

  return {
    ...state,
    items: map(item =>
      item.id === itemUpdated.id ? merge(item, itemUpdated) : item
    )(state.items),
    updating: filterBy({ "!id": itemUpdated.id })(state.updating),
  }
}
