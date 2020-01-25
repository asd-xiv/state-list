/* eslint-disable no-multi-assign */
const debug = require("debug")("ReduxList:Main")

import { hasKey } from "@mutantlove/m"

import { createAction } from "./create/create"
import {
  startReducer as createStartReducer,
  endReducer as createEndReducer,
  errorReducer as createErrorReducer,
} from "./create/create.reducers"

import { readAction } from "./read/read"
import {
  startReducer as readStartReducer,
  endReducer as readEndReducer,
  errorReducer as readErrorReducer,
} from "./read/read.reducers"

import { readOneAction } from "./read-one/read-one"
import {
  startReducer as readOneStartReducer,
  endReducer as readOneEndReducer,
  errorReducer as readOneErrorReducer,
} from "./read-one/read-one.reducers"

import { updateAction } from "./update/update"
import {
  startReducer as updateStartReducer,
  endReducer as updateEndReducer,
  errorReducer as updateErrorReducer,
} from "./update/update.reducers"

import { removeAction } from "./remove/remove"
import {
  startReducer as removeStartReducer,
  endReducer as removeEndReducer,
  errorReducer as removeErrorReducer,
} from "./remove/remove.reducers"

import { buildQueue } from "./lib/queue"

const collections = Object.create(null)

/**
 * Construct a set of actions and reducers to manage a state slice as an array
 *
 * @param {string}   name     Unique name so actions dont overlap
 * @param {Object}   methods  Object with CRUD method
 * @param {Function} onChange Function triggered on every list change
 *
 * @return {Object}
 */
const buildList = (name, methods = {}, onChange) => {
  if (hasKey(name)(collections)) {
    throw new Error(`ReduxList: List with name "${name}" already exists`)
  }

  collections[name] = true

  const queue = buildQueue()
  const createStart = `${name}_CREATE_START`
  const createEnd = `${name}_CREATE_END`
  const createError = `${name}_CREATE_ERROR`
  const readStart = `${name}_READ_START`
  const readEnd = `${name}_READ_END`
  const readError = `${name}_READ_ERROR`
  const readOneStart = `${name}_READ-ONE_START`
  const readOneEnd = `${name}_READ-ONE_END`
  const readOneError = `${name}_READ-ONE_ERROR`
  const updateStart = `${name}_UPDATE_START`
  const updateEnd = `${name}_UPDATE_END`
  const updateError = `${name}_UPDATE_ERROR`
  const removeStart = `${name}_REMOVE_START`
  const removeEnd = `${name}_REMOVE_END`
  const removeError = `${name}_REMOVE_ERROR`

  return {
    name,

    create: (
      dispatch,
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
          type: createEnd,
          payload: {
            listName: name,
            items: Array.isArray(data) ? data : [data],
            onChange,
          },
        })

        return Promise.resolve({ result: data })
      }

      return queue.enqueue({
        id: `${name}__create`,
        fn: createAction({
          listName: name,
          dispatch,
          api: methods.create,
          actionStart: createStart,
          actionEnd: createEnd,
          actionError: createError,
          onChange,
        }),

        // queue calls fn(...args)
        args: [data, { isLocal, ...restOptions }, ...rest],
      })
    },

    read: (dispatch, ...args) => {
      if (typeof methods.read !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."read" must be a function, got "${typeof methods.read}"`
        )
      }

      return queue.enqueue({
        id: `${name}__read`,
        fn: readAction({
          dispatch,
          api: methods.read,
          actionStart: readStart,
          actionEnd: readEnd,
          actionError: readError,
          onChange,
        }),

        // queue calls fn(...args)
        args,
      })
    },

    readOne: (dispatch, ...args) => {
      if (typeof methods.readOne !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."readOne" must be a function, got "${typeof methods.readOne}"`
        )
      }

      return queue.enqueue({
        id: `${name}__readOne`,
        fn: readOneAction({
          listName: name,
          dispatch,
          api: methods.readOne,
          actionStart: readOneStart,
          actionEnd: readOneEnd,
          actionError: readOneError,
          onChange,
        }),

        // queue calls fn(...args)
        args,
      })
    },

    update: (
      dispatch,
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
          type: updateEnd,
          payload: {
            listName: name,
            item: { id, ...data },
            onChange,
          },
        })

        return Promise.resolve({ result: { id, ...data } })
      }

      return queue.enqueue({
        id: `${name}__update`,
        fn: updateAction({
          listName: name,
          dispatch,
          api: methods.update,
          actionStart: updateStart,
          actionEnd: updateEnd,
          actionError: updateError,
          onChange,
        }),

        // queue calls fn(...args)
        args: [id, data, { isLocal, ...restOptions }, ...rest],
      })
    },

    remove: (
      dispatch,
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
          type: removeEnd,
          payload: {
            listName: name,
            item: { id },
            onChange,
          },
        })

        return Promise.resolve({ result: { id } })
      }

      return queue.enqueue({
        id: `${name}__remove`,
        fn: removeAction({
          listName: name,
          dispatch,
          api: methods.remove,
          actionStart: removeStart,
          actionEnd: removeEnd,
          actionError: removeError,
          onChange,
        }),

        // queue calls fn(...args)
        args: [id, { isLocal, ...restOptions }, ...rest],
      })
    },

    clear: dispatch => {
      dispatch({
        type: readEnd,
        payload: {
          items: [],
          shouldClear: true,
        },
      })

      return Promise.resolve([])
    },

    reducer: (
      state = {
        items: [],
        reading: null,
        creating: [],
        updating: [],
        removing: [],

        errors: {
          read: null,
          readOne: null,
          create: null,
          remove: null,
          update: null,
        },

        loadDate: null,
        isLoading: false,
      },
      { type, payload }
    ) => {
      switch (type) {
        // Create
        case createStart:
          return createStartReducer(state, payload)
        case createEnd:
          return createEndReducer(state, payload)
        case createError:
          return createErrorReducer(state, payload)

        // Read
        case readStart:
          return readStartReducer(state, payload)
        case readEnd:
          return readEndReducer(state, payload)
        case readError:
          return readErrorReducer(state, payload)

        // ReadOne
        case readOneStart:
          return readOneStartReducer(state, payload)
        case readOneEnd:
          return readOneEndReducer(state, payload)
        case readOneError:
          return readOneErrorReducer(state, payload)

        // Update
        case updateStart:
          return updateStartReducer(state, payload)
        case updateEnd:
          return updateEndReducer(state, payload)
        case updateError:
          return updateErrorReducer(state, payload)

        // Delete
        case removeStart:
          return removeStartReducer(state, payload)
        case removeEnd:
          return removeEndReducer(state, payload)
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
