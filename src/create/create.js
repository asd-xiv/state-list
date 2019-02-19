const debug = require("debug")("ReduxAllIsList:Create")

import { map, hasWith } from "@asd14/m"

/**
 * Call API to create a new item, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  api              API method
 * @param  {string}    actionStartName  Action dispatched before API call
 * @param  {string}    actionEndName    Action dispatched after API call
 *
 * @return {Object}
 */
export const createAction = ({
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
 * @param  {Object}  state             Old state
 * @param  {Object}  arg2              The argument 2
 * @param  {Object}  arg2.itemCreated  Newly created item
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
