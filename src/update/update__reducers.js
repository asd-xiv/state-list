const debug = require( "debug" )( "ReduxAllIsList:UpdateReducer" )

/**
 * Enable UI flag for updating item
 *
 * @param  {Object}  state  The state
 *
 * @return {Object}
 */
export const updateStart = ( state, { id } ) => {
  const isUpdating = has( id )( state.updatingIds )

  isUpdating && debug( "listUpdateStart: ID already updating ... doing nothing (will still trigger a rerender)", {
    id,
    updatingIds: state.updatingIds,
  } )

  return {
    ...state,
    updatingIds: isUpdating
      ? state.updatingIds
      : [ ...state.updatingIds, id ],
  }
}

/**
 * Update new item in the list
 *
 * @param  {Object}  state             The state
 * @param  {Object}  arg2              Payload
 * @param  {Object}  arg2.updatedItem  API response
 *
 * @return {Object}
 */
export const updateEnd = ( state, { updatedItem } ) => ( {
  ...state,
  updatingIds: remove( updatedItem.id )( state.updatingIds ),
  items      : state.items.map( element =>
    element.id === updatedItem.id
      ? merge( element, updatedItem )
      : element
  ),
} )
