const debug = require("debug")("ReduxList:Main")

import { get, pipe, findWith, hasWith, is, isEmpty, hasKey } from "@mutant-ws/m"

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
 * @param {Object}   hooks    Transformer functions called when specific actions
 *                            occur
 * @param {Function} onChange Function triggered on every list change
 *
 * @return {Object}
 */
const buildList = ({
  name,

  // crud
  create,
  read,
  readOne,
  update,
  remove,

  // hooks
  onChange,
} = {}) => {
  if (isEmpty(name)) {
    throw new Error(
      `ReduxList: "name" property is required, received "${JSON.stringify(
        name
      )}"`
    )
  }

  if (hasKey(name)(collections)) {
    throw new Error(`ReduxList: List with name "${name}" already exists`)
  }

  collections[name] = true

  let dispatch = null
  let hasDispatchStart = true
  let hasDispatchEnd = true
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

    set: props => {
      if (is(props.dispatch)) {
        dispatch = props.dispatch
      }

      if (is(props.hasDispatchStart)) {
        hasDispatchStart = props.hasDispatchStart
      }

      if (is(props.hasDispatchEnd)) {
        hasDispatchEnd = props.hasDispatchEnd
      }
    },

    create: (data, { isLocal = false, ...options } = {}) => {
      if (isLocal === false && typeof create !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."create" must be a function, got "${typeof create}"`
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
          api: create,
          hasDispatchStart,
          hasDispatchEnd,
          onChange,
        }),

        // queue calls fn(...args)
        args: [data, { isLocal, ...options }],
      })
    },

    read: (query, options) => {
      if (typeof read !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."read" must be a function, got "${typeof read}"`
        )
      }

      return queue.enqueue({
        id: `${name}__read`,
        fn: readAction({
          listName: name,
          dispatch,
          api: read,
          hasDispatchStart,
          hasDispatchEnd,
          onChange,
        }),

        // queue calls fn(...args)
        args: [query, options],
      })
    },

    readOne: (query, options) => {
      if (typeof readOne !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."readOne" must be a function, got "${typeof readOne}"`
        )
      }

      return queue.enqueue({
        id: `${name}__readOne`,
        fn: readOneAction({
          listName: name,
          dispatch,
          api: readOne,
          hasDispatchStart,
          hasDispatchEnd,
          onChange,
        }),

        // queue calls fn(...args)
        args: [query, options],
      })
    },

    update: (id, data, { isLocal = false, ...options } = {}) => {
      if (isLocal === false && typeof update !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."update" must be a function, got "${typeof update}"`
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
          api: update,
          hasDispatchStart,
          hasDispatchEnd,
          onChange,
        }),

        // queue calls fn(...args)
        args: [id, data, { isLocal, ...options }],
      })
    },

    remove: (id, { isLocal = false, ...options } = {}) => {
      if (isLocal === false && typeof remove !== "function") {
        throw new TypeError(
          `ReduxList: "${name}"."remove" must be a function, got "${typeof remove}"`
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
          api: remove,
          hasDispatchStart,
          hasDispatchEnd,
          onChange,
        }),

        // queue calls fn(...args)
        args: [id, { isLocal, ...options }],
      })
    },

    clear: () => {
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

    selector: state => ({
      head: () => get([name, "items", 0])(state),

      byId: (id, notFoundDefault) =>
        pipe(get([name, "items"]), findWith({ id }, notFoundDefault))(state),

      items: () => get([name, "items"])(state),
      creating: () => get([name, "creating"])(state),
      updating: () => get([name, "updating"])(state),
      removing: () => get([name, "removing"])(state),
      error: action => get([name, "errors", action])(state),

      hasWithId: id => pipe(get([name, "items"]), hasWith({ id }))(state),
      isCreating: () => !pipe(get([name, "creating"]), isEmpty)(state),
      isRemoving: id => {
        const removing = get([name, "removing"])(state)

        return is(id) ? hasWith({ id })(removing) : !isEmpty(removing)
      },
      isUpdating: id => {
        const updating = get([name, "updating"])(state)

        return is(id) ? hasWith({ id })(updating) : !isEmpty(updating)
      },
      isLoading: () => get([name, "isLoading"])(state),
      isLoaded: () => pipe(get([name, "loadDate"]), is)(state),
    }),
  }
}

export { buildList }
