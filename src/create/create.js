const debug = require("debug")("ReduxCollections:Create")

import { map, hasWith, is } from "@leeruniek/functies"

/**
 * Call API to create a new item, dispatch actions before and after
 *
 * @param  {Function}  dispatch     Redux dispatch
 * @param  {Function}  api          API method
 * @param  {string}    actionStart  Action dispatched before API call
 * @param  {string}    actionEnd    Action dispatched after API call
 *
 * @param  {Object}    data         Model data
 *
 * @return {Promise<Object>}
 */
export const createAction = ({
  cache,
  dispatch,
  api,
  actionStart,
  actionEnd,
}) => data => {
  dispatch({
    type: actionStart,
    payload: {
      itemCreating: data,
    },
  })

  return Promise.resolve(api(data)).then(result => {
    is(cache) && cache.clear()

    dispatch({
      type: actionEnd,
      payload: {
        itemCreated: result,
      },
    })

    return result
  })
}

/**
 * Modify state to indicate an item is being created
 *
 * @param {Object}  state  Old state
 *
 * @return {Object} New state
 */
export const createStartReducer = (state, { itemCreating }) => ({
  ...state,
  itemCreating,
  isCreating: true,
})

/**
 * Add newly created item to list
 *
 * @param  {Object}  state                Old state
 * @param  {Object}  payload              Data comming from action
 * @param  {Object}  payload.itemCreated  Newly created item
 *
 * @return {Object} New state
 */
export const createEndReducer = (state, { itemCreated }) => {
  const exists = hasWith({ id: itemCreated.id })(state.items)

  exists &&
    debug("createEndReducer: element ID already exists, replacing", {
      itemCreated,
      items: state.items,
    })

  return {
    ...state,
    items: exists
      ? map(item => (item.id === itemCreated.id ? itemCreated : item))(
          state.items
        )
      : [...state.items, itemCreated],
    itemCreating: {},
    isCreating: false,
  }
}
