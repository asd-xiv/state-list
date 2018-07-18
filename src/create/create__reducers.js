const debug = require( "debug" )( "ReduxAllIsList:CreateReducer" )

/**
 * Enable UI flag for creating new item
 *
 * @param {Object}  state  The state
 *
 * @return {Object}
 */
export const createStart = ( state, { creatingItem = {} } = {} ) => ( {
  ...state,
  creatingItem,
  isCreating: true,
} )

/**
 * Add new item, acts as upsert
 *
 * @param  {Object}  state             The state
 * @param  {Object}  arg2              The argument 2
 * @param  {Object}  arg2.createdItem  The created item
 *
 * @return {Object}
 */
export const createEnd = ( state, { createdItem } ) => {
  const exists = hasWith( { id: createdItem.id } )( state.items )

  exists && debug( "listCreateEnd: element ID already exists ... replacing", {
    createdItem,
    items: state.items,
  } )

  return {
    ...state,
    items: exists
      ? state.items.map( element =>
        element.id === createdItem.id ? createdItem : element )
      : [ ...state.items, createdItem ],
    isCreating  : false,
    creatingItem: {},
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
export const bulkCreateEnd = ( state, { created } ) => ( {
  ...state,
  items: reduce( ( acc, newElement ) =>
    hasWith( { id: newElement.id } )( acc )

      // array__concat with custom function to decide if append or merge
      ? map( existingElement =>
        newElement.id === existingElement.id
          ? { ...existingElement, ...newElement }
          : existingElement
      )( acc )
      : [ ...acc, newElement ], state.items )( created ),
  isCreating  : false,
  creatingItem: {},
} )
