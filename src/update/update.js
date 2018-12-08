const debug = require("debug")("ReduxAllIsList:ListUpdate")

import { map, filterBy, merge, hasWith } from "@asd14/m"

/**
 * Call API to update an item, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch function
 * @param  {Function}  apiMethod        API interaction functions
 * @param  {string}    actionStartName  Action name to dispatch before API
 * @param  {string}    actionEndName    Action name to dispatch after API
 *
 * @return {Promise<Object>}
 */
export const updateAction = ({
  dispatch,
  apiMethod,
  actionStartName,
  actionEndName,
}) => (id, data) => {
  dispatch({
    type: actionStartName,
    payload: {
      id,
      data,
    },
  })

  return apiMethod(id, data).then(itemUpdated => {
    dispatch({
      type: actionEndName,
      payload: {
        item: itemUpdated,
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
export const updateEndReducer = (state, { item }) => ({
  ...state,
  items:
    state.items
    |> map(itemsMapElm =>
      itemsMapElm.id === item.id ? merge(itemsMapElm, item) : itemsMapElm
    ),
  itemsUpdating: filterBy({ "!id": item.id })(state.itemsUpdating),
})
