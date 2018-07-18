const debug = require( "debug" )( "ReduxAllIsList:ReadReducer" )

/**
 * Enable UI flag for list loading
 *
 * @param {Object}  state  The state
 *
 * @return {Object}
 */
export const loadStart = state => ( {
  ...state,
  isLoading  : !!state.lastLoadAt,
  isReloading: !state.lastLoadAt,
} )

/**
 * Add newly received items, keep list without duplicates
 *
 * @param {Object}  state  The state
 *
 * @return {Object}
 */
export const loadEnd = ( state, { items } ) => ( {
  ...state,
  items,
  isLoading  : false,
  isReloading: false,
  lastLoadAt : new Date(),
} )
