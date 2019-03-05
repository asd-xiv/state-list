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
      payload: {
        itemUpdated,
      },
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
  const isAlreadyUpdating = hasWith({ id })(state.itemsUpdating)

  isAlreadyUpdating &&
    debug(
      "updateStartReducer: ID already updating, doing nothing (will still trigger a rerender)",
      {
        id,
        itemsUpdating: state.itemsUpdating,
      }
    )

  return {
    ...state,
    itemsUpdating: isAlreadyUpdating
      ? state.itemsUpdating
      : [...state.itemsUpdating, { id, data }],
  }
}

/**
 * Add newly created item to list
 *
 * @param {Object}  state        Current state
 * @param {Object}  arg2         Payload
 * @param {Object}  arg2.update  API response
 *
 * @return {Object}
 */
export const updateEndReducer = (state, { itemUpdated }) => ({
  ...state,
  items: map(item =>
    item.id === itemUpdated.id ? merge(item, itemUpdated) : item
  )(state.items),
  itemsUpdating: filterBy({ "!id": itemUpdated.id })(state.itemsUpdating),
})
