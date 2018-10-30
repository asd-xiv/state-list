const debug = require("debug")("ReduxAllIsList:Main")

import {
  findBy,
  has,
  hasWith,
  is,
  isEmpty,
  type as typeOf,
} from "@codemachiner/m"

import {
  createAction,
  createStartReducer,
  createEndReducer,
} from "./create/create"
import { findAction, findStartReducer, findEndReducer } from "./find/find"
import {
  updateAction,
  updateStartReducer,
  updateEndReducer,
} from "./update/update"
import {
  deleteAction,
  deleteStartReducer,
  deleteEndReducer,
} from "./delete/delete"

const collectionNames = Object.create(null)

/**
 * Creates a colection
 *
 * @param  {Object}  arg1       Collection props
 * @param  {string}  arg1.name  Unique name so actions dont overlap
 *
 * @return {Object}
 */
export const buildList = ({ name, methods = {} }) => {
  if (collectionNames[name]) {
    throw new Error(
      `ReduxAllIsList: Redux actions collision, "${name}" collection already exists`
    )
  }

  const createStartActionName = `${name}_CREATE_START`
  const createEndActionName = `${name}_CREATE_END`
  const loadStartActionName = `${name}_LOAD_START`
  const loadEndActionName = `${name}_LOAD_END`
  const updateStartActionName = `${name}_UPDATE_START`
  const updateEndActionName = `${name}_UPDATE_END`
  const deleteStartActionName = `${name}_DELETE_START`
  const deleteEndActionName = `${name}_DELETE_END`

  return {
    create: dispatch =>
      typeOf(methods.create) === "Function"
        ? createAction({
            dispatch,
            apiMethod: methods.create,
            startAction: createStartActionName,
            endAction: createEndActionName,
          })
        : () => {
            throw new TypeError(
              `ReduxAllIsList - "${name}": Expected "create" action of type Function, got "${typeOf(
                methods.create
              )}"`
            )
          },

    /**
     * Load list items, dispatch events before and after
     *
     * @param  {Function}  dispatch  Redux dispatch function
     * @param  {Array}     args      API method parameters
     *
     * @return {void}
     */
    find: dispatch =>
      typeOf(methods.find) === "Function"
        ? findAction({
            dispatch,
            apiMethod: methods.find,
            actionStartName: loadStartActionName,
            actionEndName: loadEndActionName,
          })
        : () => {
            throw new TypeError(
              `ReduxAllIsList - "${name}": Expected "find" action of type Function, got "${typeOf(
                methods.find
              )}"`
            )
          },

    /**
     * Update an item, dispatch events before and after
     *
     * @param  {Function}       dispatch  Redux dispatch function
     * @param  {Number|string}  id        Item id
     * @param  {Array}          rest      API method parameters
     *
     * @return {void}
     */
    update: dispatch =>
      typeOf(methods.update) === "Function"
        ? updateAction({
            dispatch,
            apiMethod: methods.update,
            actionStartName: updateStartActionName,
            actionEndName: updateEndActionName,
          })
        : () => {
            throw new TypeError(
              `ReduxAllIsList - "${name}": Expected "update" action of type Function, got "${typeOf(
                methods.update
              )}"`
            )
          },

    /**
     * Update an item, dispatch events before and after
     *
     * @param  {Function}       dispatch  Redux dispatch function
     * @param  {Number|string}  id        Item id
     * @param  {Array}          rest      API method parameters
     *
     * @return {void}
     */
    delete: dispatch =>
      typeOf(methods.delete) === "Function"
        ? deleteAction({
            dispatch,
            apiMethod: methods.delete,
            actionStartName: deleteStartActionName,
            actionEndName: deleteEndActionName,
          })
        : () => {
            throw new TypeError(
              `ReduxAllIsList - "${name}": Expected "delete" action of type Function, got "${typeOf(
                methods.delete
              )}"`
            )
          },

    /**
     * Empty list
     *
     * @param  {Function}  dispatch  Redux dispatch function
     *
     * @return {void}
     */
    clear: dispatch => async () => {
      dispatch({
        type: loadEndActionName,
        payload: {
          items: [],
        },
      })

      return []
    },

    /**
     * Empty list
     *
     * @param  {Function}  dispatch  Redux dispatch function
     *
     * @return {void}
     */
    add: dispatch => async item => {
      dispatch({
        type: createEndActionName,
        payload: {
          item,
        },
      })

      return item
    },

    /**
     * Instead of a traditional switch by type
     *
     * @param  {Object}  state         The state
     * @param  {Object}  arg2          The argument 2
     * @param  {string}  arg2.type     The type
     * @param  {mixed}   arg2.payload  The payload
     *
     * @return {Object}
     */
    reducers: (
      state = {
        items: [],
        itemsUpdating: [],
        itemsDeletingIds: [],

        errors: [],
        lastLoadAt: null,

        isLoading: false,
        isReloading: false,
        isCreating: false,
      },
      { type, payload }
    ) => {
      switch (type) {
        /*
         * C
         */
        case createStartActionName:
          return createStartReducer(state, payload)
        case createEndActionName:
          return createEndReducer(state, payload)

        /*
         * R
         */
        case loadStartActionName:
          return findStartReducer(state, payload)
        case loadEndActionName:
          return findEndReducer(state, payload)

        /*
         * U
         */
        case updateStartActionName:
          return updateStartReducer(state, payload)
        case updateEndActionName:
          return updateEndReducer(state, payload)

        /*
         * D
         */
        case deleteStartActionName:
          return deleteStartReducer(state, payload)
        case deleteEndActionName:
          return deleteEndReducer(state, payload)

        default:
          return state
      }
    },
  }
}

/**
 * { lambda_description }
 *
 * @param {Object}  slice  The slice
 *
 * @return {Object}
 */
export const listSelector = slice => ({
  head: () => slice.items[0],
  byId: id => findBy({ id })(slice.items),

  items: () => slice.items,
  itemsUpdating: () => slice.itemsUpdating,
  itemsDeletingIds: () => slice.itemsDeletingIds,

  isLoaded: () => is(slice.lastLoadAt),
  isLoading: () => slice.isLoading || slice.isReloading,
  isCreating: () => slice.isCreating,
  isUpdating: id =>
    id ? hasWith({ id })(slice.itemsUpdating) : !isEmpty(slice.itemsUpdating),
  isDeleting: id =>
    id ? has(id)(slice.itemsDeletingIds) : !isEmpty(slice.itemsDeletingIds),
})
