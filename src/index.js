/* eslint-disable no-multi-assign */

const debug = require("debug")("ReduxCollections:Main")

import { findBy, has, hasWith, is, isEmpty } from "@leeruniek/functies"
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

import { buildQueue } from "../lib/queue"
import { buildCacheStore } from "../lib/cache"

const collections = Object.create(null)

const hasKey = key => obj => Object.prototype.hasOwnProperty.call(obj, key)

/**
 * List factory function
 *
 * @param  {Object}  props           Collection props
 * @param  {string}  props.name      Unique name so actions dont overlap
 * @param  {number}  props.cacheTTL  If present, all .find requests are cached
 *                                   for this amount of milliseconds
 *
 * @return {Object}
 */
export const buildCollection = ({ name, cacheTTL = 0, methods = {} }) => {
  if (hasKey(name)(collections)) {
    throw new Error(`ReduxCollections: List with name "${name}" already exists`)
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
      createEnd: `${name}_CREATE_END`,
      loadStart: `${name}_LOAD_START`,
      loadEnd: `${name}_LOAD_END`,
      updateStart: `${name}_UPDATE_START`,
      updateEnd: `${name}_UPDATE_END`,
      deleteStart: `${name}_DELETE_START`,
      deleteEnd: `${name}_DELETE_END`,
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
      byId: id => findBy({ id })(state[name].items),

      items: () => state[name].items,
      itemsUpdating: () => state[name].itemsUpdating,
      itemsDeletingIds: () => state[name].itemsDeletingIds,
      itemCreating: () => state[name].itemCreating,

      isLoaded: () => is(state[name].loadDate),
      isLoading: () => state[name].isLoading || state[name].isReloading,
      isCreating: () => state[name].isCreating,
      isUpdating: id =>
        id
          ? hasWith({ id })(state[name].itemsUpdating)
          : !isEmpty(state[name].itemsUpdating),
      isDeleting: id =>
        id
          ? has(id)(state[name].itemsDeletingIds)
          : !isEmpty(state[name].itemsDeletingIds),
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
        ? (...args) =>
            collection.queue.enqueue({
              fn: createAction({
                cache: collection.cache,
                dispatch,
                api: methods.create,
                actionStart: collection.actions.createStart,
                actionEnd: collection.actions.createEnd,
              }),
              args,
            })
        : () => {
            throw new TypeError(
              `ReduxCollections: "${name}"."create" should be a function, got "${typeof methods.create}"`
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
          `ReduxCollections: "${name}"."find" should be a function, got "${typeof methods.find}"`
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
        ? (...args) =>
            collection.queue.enqueue({
              fn: updateAction({
                cache: collection.cache,
                dispatch,
                api: methods.update,
                actionStart: collection.actions.updateStart,
                actionEnd: collection.actions.updateEnd,
              }),
              args,
            })
        : () => {
            throw new TypeError(
              `ReduxCollections: "${name}"."update" should be a function, got "${typeof methods.update}"`
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
      typeof methods.delete === "function"
        ? (...args) =>
            collection.queue.enqueue({
              fn: deleteAction({
                cache: collection.cache,
                dispatch,
                api: methods.delete,
                actionStart: collection.actions.deleteStart,
                actionEnd: collection.actions.deleteEnd,
              }),
              args,
            })
        : () => {
            throw new TypeError(
              `ReduxCollections: "${name}"."delete" should be a function, got "${typeof methods.delete}"`
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
        type: collection.acitons.loadEnd,
        payload: {
          items: [],
        },
      })

      return Promise.resolve([])
    },

    /**
     * Empty list
     *
     * @param  {Function}  dispatch  Redux dispatch function
     *
     * @return {void}
     */
    add: dispatch => item => {
      hasCache && collection.cache.clear()

      dispatch({
        type: collection.actions.createEnd,
        payload: {
          item,
        },
      })

      return Promise.resolve(item)
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
        itemsUpdating: [],
        itemsDeletingIds: [],
        itemCreating: {},

        errors: [],
        loadDate: null,

        isLoading: false,
        isReloading: false,
        isCreating: false,
      },
      { type, payload }
    ) => {
      switch (type) {
        /*
         * Create
         */
        case collection.actions.createStart:
          return createStartReducer(state, payload)
        case collection.actions.createEnd:
          return createEndReducer(state, payload)

        /*
         * Read
         */
        case collection.actions.loadStart:
          return findStartReducer(state, payload)
        case collection.actions.loadEnd:
          return findEndReducer(state, payload)

        /*
         * Update
         */
        case collection.actions.updateStart:
          return updateStartReducer(state, payload)
        case collection.actions.updateEnd:
          return updateEndReducer(state, payload)

        /*
         * Delete
         */
        case collection.actions.deleteStart:
          return deleteStartReducer(state, payload)
        case collection.actions.deleteEnd:
          return deleteEndReducer(state, payload)

        default:
          return state
      }
    },
  }
}
