const debug = require( "debug" )( "ReduxAllIsList:DeleteReducer" )

/**
 * Enable UI flag for removing item
 *
 * @param  {Object}  state    The state
 * @param  {Object}  arg2     Payload
 * @param  {Object}  arg2.id  Item id
 *
 * @return {Object}
 */
export const deleteStart = ( state, { id } ) => {
  const isDeleting = has( id )( state.deletingIds )

  isDeleting && debug( "listDeleteStart: ID already deleting ... doing nothing (will still trigger a rerender)", {
    id,
    deletingIds: state.deletingIds,
  } )

  return {
    ...state,
    deletingIds: isDeleting ? state.deletingIds
      : [ ...state.deletingIds, id ],
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
export const deleteEnd = ( state, { id } ) => ( {
  ...state,
  deletingIds: remove( id )( state.deletingIds ),
  items      : filterBy( {
    "!id": id,
  } )( state.items ),
} )
