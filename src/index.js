const debug = require("debug")("ReduxAllIsList:Main")

const { findBy, has, hasWith, is, isEmpty, type: typeOf } = require("@asd14/m")
const {
  createAction,
  createStartReducer,
  createEndReducer,
} = require("./create/create")
const { findAction, findStartReducer, findEndReducer } = require("./find/find")
const {
  updateAction,
  updateStartReducer,
  updateEndReducer,
} = require("./update/update")
const {
  deleteAction,
  deleteStartReducer,
  deleteEndReducer,
} = require("./delete/delete")

const collectionNames = Object.create(null)

/**
 * List factory function
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
    name,

    /**
     * Selector over the list's state slice
     *
     * @param  {Object}  state  The parent state slice
     *
     * @return {Object<string, Function>}
     */
    selector: state => ({
      head: () => state[name].items[0],
      byId: id => findBy({ id })(state[name].items),

      items: () => state[name].items,
      itemsUpdating: () => state[name].itemsUpdating,
      itemsDeletingIds: () => state[name].itemsDeletingIds,

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
      typeOf(methods.create) === "Function"
        ? createAction({
            dispatch,
            apiMethod: methods.create,
            actionStartName: createStartActionName,
            actionEndName: createEndActionName,
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
    reducer: (
      state = {
        items: [],
        itemsUpdating: [],
        itemsDeletingIds: [],

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
        case createStartActionName:
          return createStartReducer(state, payload)
        case createEndActionName:
          return createEndReducer(state, payload)

        /*
         * Read
         */
        case loadStartActionName:
          return findStartReducer(state, payload)
        case loadEndActionName:
          return findEndReducer(state, payload)

        /*
         * Update
         */
        case updateStartActionName:
          return updateStartReducer(state, payload)
        case updateEndActionName:
          return updateEndReducer(state, payload)

        /*
         * Delete
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
