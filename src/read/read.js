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
    const result = await api(...args)

    dispatch({
      type: actionSuccess,
      payload: Array.isArray(result) ? result : [result],
    })

    return { result }
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

export const readStartReducer = state => ({
  ...state,
  isLoading: true,
})

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
