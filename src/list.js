const debug = require("debug")("ReduxAllIsList:Main")

import { createStart, createEnd } from "./create/create.reducers"
import { loadStart, loadEnd } from "./find/find.reducers"
import { updateStart, updateEnd } from "./update/update.reducers"
import { deleteStart, deleteEnd } from "./delete/delete.reducers"

import {
  type as typeOf,
  findBy,
  has,
  hasWith,
  is,
  isEmpty,
} from "@codemachiner/m"

const collectionNames = Object.create(null)

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
      `ReduxCollectionUtils: Redux actions collision, "${name}" collection already exists`
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
    /**
     * Create an item, dispatch events before and after
     *
     * @param  {Function}  dispatch  Redux dispatch function
     * @param  {Array}     args      API method parameters
     *
     * @return {void}
     */
    create: dispatch =>
      typeOf(methods.create) === "Function"
        ? async (...args) => {
            dispatch({
              type: createStartActionName,
            })

            const newItem = await methods.create(...args)

            dispatch({
              type: createEndActionName,
              payload: {
                item: newItem,
              },
            })

            return newItem
          }
        : () => {
            throw new TypeError(
              `ReduxCollectionUtils - "${name}": Expected "create" action of type Function, got "${typeOf(
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
    find:
      typeOf(methods.find) === "Function"
        ? dispatch => async (...args) => {
            dispatch({
              type: loadStartActionName,
            })

            const items = await methods.find(...args)

            dispatch({
              type: loadEndActionName,
              payload: {
                items: Array.isArray(items) ? items : [items],
              },
            })

            return items
          }
        : () => {
            throw new TypeError(
              `ReduxCollectionUtils - "${name}": Expected "find" action of type Function, got "${typeOf(
                methods.find
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
     * Update an item, dispatch events before and after
     *
     * @param  {Function}       dispatch  Redux dispatch function
     * @param  {Number|string}  id        Item id
     * @param  {Array}          rest      API method parameters
     *
     * @return {void}
     */
    update:
      typeOf(methods.update) === "Function"
        ? dispatch => async (id, data, { shouldUpdateServer = true } = {}) => {
            shouldUpdateServer &&
              dispatch({
                type: updateStartActionName,
                payload: {
                  id,
                  data,
                },
              })

            const updatedItem = shouldUpdateServer
              ? await methods.update(id, data)
              : {
                  id,
                  ...data,
                }

            dispatch({
              type: updateEndActionName,
              payload: {
                item: updatedItem,
              },
            })

            return updatedItem
          }
        : () => {
            throw new TypeError(
              `ReduxCollectionUtils - "${name}": Expected "update" action of type Function, got "${typeOf(
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
        ? async (id, ...rest) => {
            dispatch({
              type: deleteStartActionName,
              payload: {
                id,
              },
            })

            await methods.delete(id, ...rest)

            dispatch({
              type: deleteEndActionName,
              payload: {
                id,
              },
            })

            return id
          }
        : () => {
            throw new TypeError(
              `ReduxCollectionUtils - "${name}": Expected "delete" action of type Function, got "${typeOf(
                methods.delete
              )}"`
            )
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
          return createStart(state, payload)
        case createEndActionName:
          return createEnd(state, payload)

        /*
         * R
         */
        case loadStartActionName:
          return loadStart(state, payload)
        case loadEndActionName:
          return loadEnd(state, payload)

        /*
         * U
         */
        case updateStartActionName:
          return updateStart(state, payload)
        case updateEndActionName:
          return updateEnd(state, payload)

        /*
         * D
         */
        case deleteStartActionName:
          return deleteStart(state, payload)
        case deleteEndActionName:
          return deleteEnd(state, payload)

        default:
          return state
      }
    },
  }
}
