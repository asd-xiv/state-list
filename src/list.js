const debug = require( "debug" )( "ReduxAllIsList:List" )

import { createStart, createEnd, bulkCreateEnd } from "reducers/create"
import { loadStart, loadEnd } from "reducers/read"
import { updateStart, updateEnd } from "reducers/update"
import { deleteStart, deleteEnd } from "reducers/delete"

const collectionNames = Object.create( null )

export const defaultState = {
  items : [],
  errors: [],

  creating  : {},
  updating  : [],
  deleting  : [],
  lastLoadAt: null,

  isLoading  : false,
  isReloading: false,
  isCreating : false,
}

/**
 * Creates a colection
 *
 * @param  {Object}  arg1       Collection props
 * @param  {string}  arg1.name  Unique name so actions dont overlap
 *
 * @return {Object}
 */
export const createCollection = ( { name } ) => {
  if ( collectionNames[ name ] ) {
    throw new Error( `Redux actions collision: "${name}" collection already defined` )
  }

  const createStart = `${name}_CREATE_START`
  const createEnd = `${name}_CREATE_END`
  const createBulkEnd = `${name}_CREATE_BULK_END`
  const loadStart = `${name}_LOAD_START`
  const loadEnd = `${name}_LOAD_END`
  const updateStart = `${name}_UPDATE_START`
  const updateEnd = `${name}_UPDATE_END`
  const deleteStart = `${name}_DELETE_START`
  const deleteEnd = `${name}_DELETE_END`

  const actions = {
    [ createStart ]  : listCreateStart,
    [ createEnd ]    : listCreateEnd,
    [ createBulkEnd ]: listBulkCreateEnd,
    [ loadStart ]    : listLoadStart,
    [ loadEnd ]      : listLoadEnd,
    [ updateStart ]  : listUpdateStart,
    [ updateEnd ]    : listUpdateEnd,
    [ deleteStart ]  : listDeleteStart,
    [ deleteEnd ]    : listDeleteEnd,
  }

  const collection = {
    events: {
      createStart,
      createEnd ,
      createBulkEnd,
      loadStart ,
      loadEnd ,
      updateStart,
      updateEnd ,
      deleteStart,
      deleteEnd ,
    },

    /**
     * Instead of a switch by action type
     *
     * @param  {Object}  state         The state
     * @param  {Object}  arg2          The argument 2
     * @param  {string}  arg2.type     The type
     * @param  {mixed}   arg2.payload  The payload
     *
     * @return {Object}
     */
    reducer: ( state = defaultState, { type, payload } ) =>
      actions[ type ]
        ? actions[ type ]( state, payload )
        : state,
  }

  return collection
}
