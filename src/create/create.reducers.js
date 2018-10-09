const debug = require("debug")("ReduxAllIsList:CreateReducers")

import { reduce, map, hasWith } from "@codemachiner/m"

/**
 * Enable UI flag for creating new item
 *
 * @param {Object}  state  The state
 *
 * @return {Object}
 */
export const createStart = state => ({
  ...state,
  isCreating: true,
})

/**
 * Add new item, acts as upsert
 *
 * @param  {Object}  state      The state
 * @param  {Object}  arg2       The argument 2
 * @param  {Object}  arg2.item  The created item
 *
 * @return {Object}
 */
export const createEnd = (state, { item }) => {
  const exists = hasWith({ id: item.id })(state.items)

  exists &&
    debug("listCreateEnd: element ID already exists ... replacing", {
      item,
      items: state.items,
    })

  return {
    ...state,
    items: exists
      ? state.items.map(
          itemsMapElm => (itemsMapElm.id === item.id ? item : itemsMapElm)
        )
      : [...state.items, item],
    isCreating: false,
  }
}

/**
 * Add new items, merges lists and replaces existing by ID
 *
 * @param  {Object}  state             The state
 * @param  {Object}  arg2              The argument 2
 * @param  {Object}  arg2.createdItem  The created item
 *
 * @return {Object}
 */
export const bulkCreateEnd = (state, { created }) => ({
  ...state,
  items: reduce(
    (acc, newElement) =>
      hasWith({ id: newElement.id })(acc)
        ? map(
            itemsMapElm =>
              newElement.id === itemsMapElm.id
                ? { ...itemsMapElm, ...newElement }
                : itemsMapElm
          )(acc)
        : [...acc, newElement],
    state.items
  )(created),
  isCreating: false,
})
