const debug = require("debug")("ReduxList:Read")

/**
 * Call API to fetch items, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  api              API method
 * @param  {string}    actionStartName  Action dispatched before API call
 * @param  {string}    actionEndName    Action dispatched after API call
 *
 * @returns {Object[]}
 */
export const readAction = ({
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => async (...args) => {
  dispatch({
    type: actionStart,
  })

  try {
    const results = await api(...args)

    dispatch({
      type: actionSuccess,
      payload: Array.isArray(results) ? results : [results],
    })

    return results
  } catch (error) {
    // wrapping here so that both reducer and this current promise
    // resolve/pass the same data
    const stateError = {
      date: new Date(),
      data: {
        name: error.name,
        message: error.message,
        status: error.status,
        body: error.body,
      },
    }

    dispatch({
      type: actionError,
      payload: stateError,
    })

    return { error: stateError }
  }
}

/**
 * Modify state to indicate the list is being loaded
 *
 * @param {Object}  state  Old state
 *
 * @return {Object} New state
 */
export const readStartReducer = state => ({
  ...state,
  isLoading: true,
})

/**
 * Add newly received items
 *
 * @param {Object}    state  Old state
 * @param {Object[]}  items  List of items
 *
 * @return {Object} New state
 */
export const readSuccessReducer = (state, items) => ({
  ...state,
  items,
  loadDate: new Date(),
  isLoading: false,
})

export const readErrorReducer = (state, error = {}) => ({
  ...state,
  errors: {
    ...state.errors,
    read: error,
  },
  items: [],
  isLoading: false,
})
