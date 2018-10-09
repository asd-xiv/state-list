const debug = require("debug")("ReduxAllIsList:FindReducers")

/**
 * Enable UI flag for list loading
 *
 * @param {Object}  state  Current state
 *
 * @return {Object}
 */
export const loadStart = state => ({
  ...state,
  isLoading: true,
  isReloading: !state.lastLoadAt,
})

/**
 * Add newly received items, keep list without duplicates
 *
 * @param {Object}  state  Current state
 *
 * @return {Object}
 */
export const loadEnd = (state, { items }) => ({
  ...state,
  items,
  lastLoadAt: new Date(),
  isLoading: false,
  isReloading: false,
})
