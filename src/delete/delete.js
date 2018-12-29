const debug = require("debug")("ReduxAllIsList:Delete")

import { has, remove, filterBy } from "@asd14/m"

/**
 * Call API to delete an item, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  apiMethod        API call
 * @param  {string}    actionStartName  Action dispatched before API
 * @param  {string}    actionEndName    Action dispatched after API
 *
 * @return {Object}
 */
export const deleteAction = ({
  dispatch,
  apiMethod,
  actionStartName,
  actionEndName,
}) => id => {
  dispatch({
    type: actionStartName,
    payload: {
      id,
    },
  })

  return Promise.resolve(apiMethod(id)).then(() => {
    dispatch({
      type: actionEndName,
      payload: {
        id,
      },
    })

    return id
  })
}

/**
 * Enable UI flag for removing item
 *
 * @param  {Object}  state    The state
 * @param  {Object}  arg2     Payload
 * @param  {Object}  arg2.id  Item id
 *
 * @return {Object}
 */
export const deleteStartReducer = (state, { id }) => {
  const isDeleting = has(id)(state.itemsDeletingIds)

  isDeleting &&
    debug(
      "listDeleteStart: ID already deleting, doing nothing (will still trigger a rerender)",
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
export const deleteEndReducer = (state, { id }) => ({
  ...state,
  itemsDeletingIds: remove(id)(state.itemsDeletingIds),
  items: filterBy({ "!id": id })(state.items),
})
