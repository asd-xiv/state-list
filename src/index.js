/* eslint-disable no-multi-assign */
const debug = require("debug")("ReduxList:Main")

import {
  pipe,
  findWith,
  sortWith,
  head,
  is,
  isEmpty,
  hasWith,
} from "@mutantlove/m"
import {
  createAction,
  createStartReducer,
  createSuccessReducer,
  createErrorReducer,
} from "./create/create"
import {
  readAction,
  readStartReducer,
  readSuccessReducer,
  readErrorReducer,
} from "./read/read"
import {
  updateAction,
  updateStartReducer,
  updateSuccessReducer,
  updateErrorReducer,
} from "./update/update"
import {
  deleteAction,
  deleteStartReducer,
  deleteSuccessReducer,
  deleteErrorReducer,
} from "./delete/delete"

import { buildQueue } from "./lib/queue"

const collections = Object.create(null)

const hasKey = key => obj => Object.prototype.hasOwnProperty.call(obj, key)

/**
 * List factory function
 *
 * @param {string} name    Unique name so actions dont overlap
 * @param {Object} methods Object with CRUD method
 *
 * @return {Object}
 */
const buildList = (name, methods = {}) => {
  if (hasKey(name)(collections)) {
    throw new Error(`ReduxList: List with name "${name}" already exists`)
  }

  collections[name] = true

  const queue = buildQueue()
  const createStart = `${name}_CREATE_START`
  const createSuccess = `${name}_CREATE_SUCCESS`
  const createError = `${name}_CREATE_ERROR`
  const readStart = `${name}_READ_START`
  const readSuccess = `${name}_READ_END`
  const readError = `${name}_READ_ERROR`
  const updateStart = `${name}_UPDATE_START`
  const updateSuccess = `${name}_UPDATE_SUCCESS`
  const updateError = `${name}_UPDATE_ERROR`
  const deleteStart = `${name}_DELETE_START`
  const deleteSuccess = `${name}_DELETE_SUCCESS`
  const deleteError = `${name}_DELETE_ERROR`

  return {
    name,

    /**
     * Selector over the list's state slice
     *
     * @param  {Object}  state  The parent state slice
     *
     * @return {Object<string, Function>}
     */
    selector: state => ({
      head: () =>
        state[name].items.length === 0 ? undefined : state[name].items[0],
      byId: id => findWith({ id })(state[name].items),

      items: () => state[name].items,
      creating: () => state[name].creating,
      updating: () => state[name].updating,
      deleting: () => state[name].deleting,

      error: action =>
        isEmpty(action)
          ? pipe(
              Object.entries,
              sortWith("date"),
              head
            )(state[name].errors)
          : state[name].errors[action],

      isCreating: () => !isEmpty(state[name].creating),
      isLoaded: () => is(state[name].loadDate),
      isLoading: () => state[name].isLoading,
      isUpdating: id =>
        id
          ? hasWith({ id })(state[name].updating)
          : !isEmpty(state[name].updating),
      isDeleting: id =>
        id
          ? hasWith({ id })(state[name].deleting)
          : !isEmpty(state[name].deleting),
    }),

    /**
     * Create an item, dispatch events before and after API call
     *
     * @param  {Function}  dispatch  Redux dispatch function
     * @param  {Array}     args      API method parameters
     *
     * @return {void}
     */
    create: dispatch =>
      typeof methods.create === "function"
        ? (data, { isDraft = false, ...restOptions } = {}, ...rest) => {
            if (isDraft) {
              dispatch({
                type: createSuccess,
                payload: data,
              })

              return Promise.resolve({ result: data })
            }

            return queue.enqueue({
              fn: createAction({
                dispatch,
                api: methods.create,
                actionStart: createStart,
                actionSuccess: createSuccess,
                actionError: createError,
              }),

              // needs array since queue calls fn(...args)
              args: [data, { isDraft, ...restOptions }, ...rest],
            })
          }
        : () => {
            throw new TypeError(
              `ReduxList: "${name}"."create" should be a function, got "${typeof methods.create}"`
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
    read: dispatch => {
      if (typeof methods.read === "function") {
        return (...args) =>
          queue.enqueue({
            fn: readAction({
              dispatch,
              api: methods.read,
              actionStart: readStart,
              actionSuccess: readSuccess,
              actionError: readError,
            }),

            // needs array since queue calls fn(...args)
            args,
          })
      }

      return () => {
        throw new TypeError(
          `ReduxList: "${name}"."read" should be a function, got "${typeof methods.red}"`
        )
      }
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
      typeof methods.update === "function"
        ? (id, data, { isDraft = false, ...restOptions } = {}, ...rest) => {
            if (isDraft) {
              dispatch({
                type: updateSuccess,
                payload: { id, ...data },
              })

              return Promise.resolve({ result: { id, ...data } })
            }

            return queue.enqueue({
              fn: updateAction({
                dispatch,
                api: methods.update,
                actionStart: updateStart,
                actionSuccess: updateSuccess,
                actionError: updateError,
              }),

              // needs array since queue calls fn(...args)
              args: [id, data, { isDraft, ...restOptions }, ...rest],
            })
          }
        : () => {
            throw new TypeError(
              `ReduxList: "${name}"."update" should be a function, got "${typeof methods.update}"`
            )
          },

    /**
     * Delete an item, dispatch events before and after
     *
     * @param  {Function}       dispatch  Redux dispatch function
     * @param  {Number|string}  id        Item id
     *
     * @param  {Array}  args  API method parameters
     *
     * @return {void}
     */
    delete: dispatch =>
      typeof methods.delete === "function"
        ? (...args) =>
            queue.enqueue({
              fn: deleteAction({
                dispatch,
                api: methods.delete,
                actionStart: deleteStart,
                actionSuccess: deleteSuccess,
                actionError: deleteError,
              }),

              // needs array since queue calls fn(...args)
              args,
            })
        : () => {
            throw new TypeError(
              `ReduxList: "${name}"."delete" should be a function, got "${typeof methods.delete}"`
            )
          },

    /**
     * Empty list
     *
     * @param  {Function}  dispatch  Redux dispatch function
     *
     * @return {void}
     */
    clear: dispatch => () => {
      dispatch({
        type: readSuccess,
        payload: [],
      })

      return Promise.resolve([])
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
    reducer: (
      state = {
        items: [],
        creating: [],
        updating: [],
        deleting: [],

        errors: {},
        loadDate: null,
        isLoading: false,
      },
      { type, payload }
    ) => {
      switch (type) {
        // Create
        case createStart:
          return createStartReducer(state, payload)
        case createSuccess:
          return createSuccessReducer(state, payload)
        case createError:
          return createErrorReducer(state, payload)

        // Read
        case readStart:
          return readStartReducer(state, payload)
        case readSuccess:
          return readSuccessReducer(state, payload)
        case readError:
          return readErrorReducer(state, payload)

        // Update
        case updateStart:
          return updateStartReducer(state, payload)
        case updateSuccess:
          return updateSuccessReducer(state, payload)
        case updateError:
          return updateErrorReducer(state, payload)

        // Delete
        case deleteStart:
          return deleteStartReducer(state, payload)
        case deleteSuccess:
          return deleteSuccessReducer(state, payload)
        case deleteError:
          return deleteErrorReducer(state, payload)

        default:
          return state
      }
    },
  }
}

export { buildList, buildList as buildCollection }
