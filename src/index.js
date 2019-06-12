/* eslint-disable no-multi-assign */
const debug = require("debug")("ReduxAllIsList:Main")

import { pipe, findWith, sortWith, head, is, isEmpty, hasWith } from "@asd14/m"
import {
  createAction,
  createStartReducer,
  createSuccessReducer,
  createErrorReducer,
} from "./create/create"
import { findAction, findStartReducer, findEndReducer } from "./find/find"
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
import { buildCacheStore } from "./lib/cache"

const collections = Object.create(null)

const hasKey = key => obj => Object.prototype.hasOwnProperty.call(obj, key)

/**
 * List factory function
 *
 * @param  {Object}  props           List props
 * @param  {string}  props.name      Unique name so actions dont overlap
 * @param  {number}  props.cacheTTL  If present, all .find requests are cached
 *                                   for this amount of milliseconds
 *
 * @return {Object}
 */
const buildList = ({ name, cacheTTL = 0, methods = {} }) => {
  if (hasKey(name)(collections)) {
    throw new Error(`ReduxAllIsList: List with name "${name}" already exists`)
  }

  const hasCache = !isEmpty(cacheTTL)
  const collection = (collections[name] = {
    cache: hasCache
      ? buildCacheStore({
          ttl: cacheTTL,
        })
      : undefined,
    queue: buildQueue(),
    actions: {
      createStart: `${name}_CREATE_START`,
      createSuccess: `${name}_CREATE_SUCCESS`,
      createError: `${name}_CREATE_ERROR`,
      loadStart: `${name}_LOAD_START`,
      loadEnd: `${name}_LOAD_END`,
      updateStart: `${name}_UPDATE_START`,
      updateSuccess: `${name}_UPDATE_SUCCESS`,
      updateError: `${name}_UPDATE_ERROR`,
      deleteStart: `${name}_DELETE_START`,
      deleteSuccess: `${name}_DELETE_SUCCESS`,
      deleteError: `${name}_DELETE_ERROR`,
    },
  })

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
        ? (data, { isDraft = false } = {}) => {
            hasCache && collection.cache.clear()

            if (isDraft) {
              dispatch({
                type: collection.actions.createSuccess,
                payload: data,
              })

              return Promise.resolve({ result: data })
            }

            return collection.queue.enqueue({
              fn: createAction({
                dispatch,
                api: methods.create,
                actionStart: collection.actions.createStart,
                actionSuccess: collection.actions.createSuccess,
                actionError: collection.actions.createError,
              }),

              // need to be array since queue will call fn(...args)
              args: [data],
            })
          }
        : () => {
            throw new TypeError(
              `ReduxAllIsList: "${name}"."create" should be a function, got "${typeof methods.create}"`
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
    find: dispatch => {
      if (typeof methods.find === "function") {
        return (...args) =>
          collection.queue.enqueue({
            fn: findAction({
              cache: collection.cache,
              dispatch,
              method: methods.find,
              actionStart: collection.actions.loadStart,
              actionEnd: collection.actions.loadEnd,
            }),
            args,
          })
      }

      return () => {
        throw new TypeError(
          `ReduxAllIsList: "${name}"."find" should be a function, got "${typeof methods.find}"`
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
        ? (id, data, { isDraft = false } = {}) => {
            hasCache && collection.cache.clear()

            if (isDraft) {
              dispatch({
                type: collection.actions.updateSuccess,
                payload: { id, ...data },
              })

              return Promise.resolve({ result: { id, ...data } })
            }

            return collection.queue.enqueue({
              fn: updateAction({
                dispatch,
                api: methods.update,
                actionStart: collection.actions.updateStart,
                actionSuccess: collection.actions.updateSuccess,
                actionError: collection.actions.updateError,
              }),
              args: [id, data],
            })
          }
        : () => {
            throw new TypeError(
              `ReduxAllIsList: "${name}"."update" should be a function, got "${typeof methods.update}"`
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
            collection.queue.enqueue({
              fn: deleteAction({
                cache: collection.cache,
                dispatch,
                api: methods.delete,
                actionStart: collection.actions.deleteStart,
                actionSuccess: collection.actions.deleteSuccess,
                actionError: collection.actions.deleteError,
              }),
              args,
            })
        : () => {
            throw new TypeError(
              `ReduxAllIsList: "${name}"."delete" should be a function, got "${typeof methods.delete}"`
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
      hasCache && collection.cache.clear()

      dispatch({
        type: collection.actions.loadEnd,
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
        case collection.actions.createStart:
          return createStartReducer(state, payload)
        case collection.actions.createSuccess:
          return createSuccessReducer(state, payload)
        case collection.actions.createError:
          return createErrorReducer(state, payload)

        // Read
        case collection.actions.loadStart:
          return findStartReducer(state, payload)
        case collection.actions.loadEnd:
          return findEndReducer(state, payload)

        // Update
        case collection.actions.updateStart:
          return updateStartReducer(state, payload)
        case collection.actions.updateSuccess:
          return updateSuccessReducer(state, payload)
        case collection.actions.updateError:
          return updateErrorReducer(state, payload)

        // Delete
        case collection.actions.deleteStart:
          return deleteStartReducer(state, payload)
        case collection.actions.deleteSuccess:
          return deleteSuccessReducer(state, payload)
        case collection.actions.deleteError:
          return deleteErrorReducer(state, payload)

        default:
          return state
      }
    },
  }
}

export { buildList, buildList as buildCollection }
