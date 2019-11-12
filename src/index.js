/* eslint-disable no-multi-assign */
const debug = require("debug")("ReduxList:Main")

import { hasKey } from "@mutantlove/m"
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
  readOneAction,
  readOneStartReducer,
  readOneSuccessReducer,
  readOneErrorReducer,
} from "./read-one/read-one"
import {
  updateAction,
  updateStartReducer,
  updateSuccessReducer,
  updateErrorReducer,
} from "./update/update"
import {
  removeAction,
  removeStartReducer,
  removeSuccessReducer,
  removeErrorReducer,
} from "./remove/remove"

import { buildQueue } from "./lib/queue"

const collections = Object.create(null)

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
  const readOneStart = `${name}_READ-ONE_START`
  const readOneSuccess = `${name}_READ-ONE_END`
  const readOneError = `${name}_READ-ONE_ERROR`
  const updateStart = `${name}_UPDATE_START`
  const updateSuccess = `${name}_UPDATE_SUCCESS`
  const updateError = `${name}_UPDATE_ERROR`
  const removeStart = `${name}_REMOVE_START`
  const removeSuccess = `${name}_REMOVE_SUCCESS`
  const removeError = `${name}_REMOVE_ERROR`

  return {
    name,

    /**
     * Create an item, dispatch events before and after API call
     *
     * @param  {Function}  dispatch  Redux dispatch function
     * @param  {Array}     args      API method parameters
     *
     * @return {void}
     */
    create: dispatch => (
      data,
      { isLocal = false, ...restOptions } = {},
      ...rest
    ) => {
      if (typeof methods.create !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."create" must be a function, got "${typeof methods.create}"`
        )
      }

      if (isLocal) {
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

        // queue calls fn(...args)
        args: [data, { isLocal, ...restOptions }, ...rest],
      })
    },

    /**
     * Load list items, dispatch events before and after
     *
     * @param  {Function}  dispatch  Redux dispatch function
     * @param  {Array}     args      API method parameters
     *
     * @return {void}
     */
    read: dispatch => (...args) => {
      if (typeof methods.read !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."read" must be a function, got "${typeof methods.read}"`
        )
      }

      return queue.enqueue({
        fn: readAction({
          dispatch,
          api: methods.read,
          actionStart: readStart,
          actionSuccess: readSuccess,
          actionError: readError,
        }),

        // queue calls fn(...args)
        args,
      })
    },

    /**
     * Load one item, dispatch events before and after
     *
     * @param  {Function}  dispatch  Redux dispatch function
     * @param  {Array}     args      API method parameters
     *
     * @return {void}
     */
    readOne: dispatch => (...args) => {
      if (typeof methods.readOne !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."readOne" must be a function, got "${typeof methods.readOne}"`
        )
      }

      return queue.enqueue({
        fn: readOneAction({
          dispatch,
          api: methods.readOne,
          actionStart: readOneStart,
          actionSuccess: readOneSuccess,
          actionError: readOneError,
        }),

        // queue calls fn(...args)
        args,
      })
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
    update: dispatch => (
      id,
      data,
      { isLocal = false, ...restOptions } = {},
      ...rest
    ) => {
      if (typeof methods.update !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."update" must be a function, got "${typeof methods.update}"`
        )
      }

      if (isLocal) {
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

        // queue calls fn(...args)
        args: [id, data, { isLocal, ...restOptions }, ...rest],
      })
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
    remove: dispatch => (
      id,
      { isLocal = false, ...restOptions } = {},
      ...rest
    ) => {
      if (typeof methods.remove !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."remove" must be a function, got "${typeof methods.remove}"`
        )
      }

      if (isLocal) {
        dispatch({
          type: removeSuccess,
          payload: {
            id,
          },
        })

        return Promise.resolve({ result: { id } })
      }

      return queue.enqueue({
        fn: removeAction({
          dispatch,
          api: methods.remove,
          actionStart: removeStart,
          actionSuccess: removeSuccess,
          actionError: removeError,
        }),

        // queue calls fn(...args)
        args: [id, { isLocal, ...restOptions }, ...rest],
      })
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
        reading: null,
        creating: [],
        updating: [],
        removing: [],

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

        // ReadOne
        case readOneStart:
          return readOneStartReducer(state, payload)
        case readOneSuccess:
          return readOneSuccessReducer(state, payload)
        case readOneError:
          return readOneErrorReducer(state, payload)

        // Update
        case updateStart:
          return updateStartReducer(state, payload)
        case updateSuccess:
          return updateSuccessReducer(state, payload)
        case updateError:
          return updateErrorReducer(state, payload)

        // Delete
        case removeStart:
          return removeStartReducer(state, payload)
        case removeSuccess:
          return removeSuccessReducer(state, payload)
        case removeError:
          return removeErrorReducer(state, payload)

        default:
          return state
      }
    },
  }
}

export { buildList }
export { useList } from "./use-list"
