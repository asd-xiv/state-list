const debug = require("debug")("JustAList:Main")

import {
  get,
  pipe,
  when,
  hasWith,
  filterWith,
  is,
  isEmpty,
  hasKey,
  not,
  i,
} from "@asd14/m"

import { createAction } from "./create/create"
import {
  startReducer as createStartReducer,
  endReducer as createEndReducer,
  errorReducer as createErrorReducer,
} from "./create/create.reducers"

import { readManyAction } from "./read-many/read-many"
import {
  startReducer as readManyStartReducer,
  endReducer as readManyEndReducer,
  errorReducer as readManyErrorReducer,
} from "./read-many/read-many.reducers"

import { readAction } from "./read/read"
import {
  startReducer as readStartReducer,
  endReducer as readEndReducer,
  errorReducer as readErrorReducer,
} from "./read/read.reducers"

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

const collections = Object.create(null)

/**
 * Construct a set of actions and reducers to manage a state slice as an array
 *
 * @param {string}   name     Unique list name
 * @param {Function} onChange Function triggered on every list change
 *
 * @returns {object}
 */
const buildList = ({
  name,

  // crud
  create,
  read,
  readMany,
  update,
  remove,

  // hooks
  onChange,
} = {}) => {
  if (isEmpty(name)) {
    throw new Error(
      `JustAList: "name" property is required, received "${JSON.stringify(
        name
      )}"`
    )
  }

  if (hasKey(name, collections)) {
    throw new Error(`JustAList: List with name "${name}" already exists`)
  }

  collections[name] = true

  let props = {
    dispatch: null,
  }

  const createStart = `${name}_CREATE_START`
  const createEnd = `${name}_CREATE_END`
  const createError = `${name}_CREATE_ERROR`
  const readManyStart = `${name}_READ-MANY_START`
  const readManyEnd = `${name}_READ-MANY_END`
  const readManyError = `${name}_READ-MANY_ERROR`
  const readStart = `${name}_READ_START`
  const readEnd = `${name}_READ_END`
  const readError = `${name}_READ_ERROR`
  const updateStart = `${name}_UPDATE_START`
  const updateEnd = `${name}_UPDATE_END`
  const updateError = `${name}_UPDATE_ERROR`
  const removeStart = `${name}_REMOVE_START`
  const removeEnd = `${name}_REMOVE_END`
  const removeError = `${name}_REMOVE_ERROR`

  return {
    name,

    set: source => {
      props = {
        ...props,
        ...source,
      }
    },

    /**
     * @param {object}  data
     * @param {object}  options
     * @param {boolean} options.isLocal
     * @param {boolean} options.isSilent
     *
     * @returns {Promise<{result: object, error: object}>}
     */
    create: (data, { isLocal = false, ...options } = {}) => {
      if (isLocal === false && typeof create !== "function") {
        throw new TypeError(
          `JustAList: "${name}"."create" must be a function, got "${typeof create}"`
        )
      }

      if (isLocal) {
        props.dispatch({
          type: createEnd,
          payload: {
            listName: name,
            items: Array.isArray(data) ? data : [data],
            onChange,
          },
        })

        return Promise.resolve({ result: data })
      }

      return createAction({
        listName: name,
        dispatch: props.dispatch,
        api: create,
        onChange,
      })(data, { isLocal, ...options })
    },

    /**
     * @param {object}  query
     * @param {object}  options
     * @param {boolean} options.isSilent
     * @param {boolean} options.shouldClear
     *
     * @returns {Promise<{result: object, error: object}>}
     */
    readMany: (query, options) => {
      if (typeof readMany !== "function") {
        throw new TypeError(
          `JustAList: "${name}"."readMany" must be a function, got "${typeof readMany}"`
        )
      }

      return readManyAction({
        listName: name,
        dispatch: props.dispatch,
        api: readMany,
        onChange,
      })(query, options)
    },

    read: (query, options) => {
      if (typeof read !== "function") {
        throw new TypeError(
          `JustAList: "${name}"."read" must be a function, got "${typeof read}"`
        )
      }

      return readAction({
        listName: name,
        dispatch: props.dispatch,
        api: read,
        hasDispatchStart: props.readHasDispatchStart,
        hasDispatchEnd: props.readHasDispatchEnd,
        onChange,
      })(query, options)
    },

    update: (id, data, { isLocal = false, onMerge, ...options } = {}) => {
      if (isLocal === false && typeof update !== "function") {
        throw new TypeError(
          `JustAList: "${name}"."update" must be a function, got "${typeof update}"`
        )
      }

      if (isLocal) {
        props.dispatch({
          type: updateEnd,
          payload: {
            listName: name,
            item: { id, ...data },
            onMerge,
            onChange,
          },
        })

        return Promise.resolve({ result: { id, ...data } })
      }

      return updateAction({
        listName: name,
        dispatch: props.dispatch,
        api: update,
        hasDispatchStart: props.updateHasDispatchStart,
        hasDispatchEnd: props.updateHasDispatchEnd,
        onMerge,
        onChange,
      })(id, data, options)
    },

    remove: (id, { isLocal = false, ...restOptions } = {}) => {
      if (isLocal === false && typeof remove !== "function") {
        throw new TypeError(
          `JustAList: "${name}"."remove" must be a function, got "${typeof remove}"`
        )
      }

      if (isLocal) {
        props.dispatch({
          type: removeEnd,
          payload: {
            id,
            onChange,
          },
        })

        return Promise.resolve({ result: { id } })
      }

      return removeAction({
        listName: name,
        dispatch: props.dispatch,
        api: remove,
        hasDispatchStart: props.removeHasDispatchStart,
        hasDispatchEnd: props.removeHasDispatchEnd,
        onChange,
      })(id, { isLocal, ...restOptions })
    },

    clear: () => {
      props.dispatch({
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
        listName: name,

        // reality
        items: [],

        // buffer items while methods successfuly ends
        items_optimist: [],

        // buffer items
        items_local: [],

        items_reading: [],
        items_creating: [],
        items_updating: [],
        items_removing: [],

        logs: [],
        errors: [],

        // errors: {
        //   read: null,
        //   readMany: null,
        //   create: null,
        //   update: null,
        //   remove: null,
        // },

        loadDate: null,
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

        // Read many
        case readManyStart:
          return readManyStartReducer(state, payload)
        case readManyEnd:
          return readManyEndReducer(state, payload)
        case readManyError:
          return readManyErrorReducer(state, payload)

        // Read
        case readStart:
          return readStartReducer(state, payload)
        case readEnd:
          return readEndReducer(state, payload)
        case readError:
          return readErrorReducer(state, payload)

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
      /**
       * @param {object} props
       * @param {string} props.status
       *
       * @returns {Array}
       */
      items: ({ status } = {}) =>
        get([name, is(status) ? `items_${status}` : "items"], [], state),

      /**
       * @param {object} props
       * @param {string} props.id
       * @param {string} props.status
       *
       * @returns {boolean}
       */
      is: ({ id, status = "reading" } = {}) =>
        pipe(
          get([name, `items_${status}`], []),
          when(() => is(id), hasWith({ id }), not(isEmpty))
        )(state),

      has: id => pipe(get([name, "items"]), hasWith({ id }))(state),

      logs: ({ type } = {}) =>
        pipe(
          get([name, "logs"], null),
          when(() => is(type), filterWith({ type }), i)
        )(state),

      errors: ({ type }) =>
        pipe(
          get([name, "errors"], null),
          when(() => is(type), filterWith({ type }), i)
        )(state),
    }),
  }
}

export { buildList }
