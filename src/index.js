const debug = require("debug")("ReduxAllIsList:Main")

const { findBy, has, hasWith, is, isEmpty } = require("@asd14/m")
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

const collectionNames = []

/**
 * List factory function
 *
 * @param  {Object}  arg1       Collection props
 * @param  {string}  arg1.name  Unique name so actions dont overlap
 *
 * @return {Object}
 */
export const buildList = ({ name, methods = {} }) => {
  if (has(name)(collectionNames)) {
    throw new Error(`ReduxAllIsList: List with name "${name}" already exists`)
  }

  collectionNames.push(name)

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
        ? createAction({
            dispatch,
            apiMethod: methods.create,
            actionStartName: createStartActionName,
            actionEndName: createEndActionName,
          })
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
    find: dispatch =>
      typeof methods.find === "function"
        ? findAction({
            dispatch,
            apiMethod: methods.find,
            actionStartName: loadStartActionName,
            actionEndName: loadEndActionName,
          })
        : () => {
            throw new TypeError(
              `ReduxAllIsList: "${name}"."find" should be a function, got "${typeof methods.find}"`
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
      typeof methods.update === "function"
        ? updateAction({
            dispatch,
            apiMethod: methods.update,
            actionStartName: updateStartActionName,
            actionEndName: updateEndActionName,
          })
        : () => {
            throw new TypeError(
              `ReduxAllIsList: "${name}"."update" should be a function, got "${typeof methods.update}"`
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
        ? deleteAction({
            dispatch,
            apiMethod: methods.delete,
            actionStartName: deleteStartActionName,
            actionEndName: deleteEndActionName,
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
      dispatch({
        type: loadEndActionName,
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
      dispatch({
        type: createEndActionName,
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
