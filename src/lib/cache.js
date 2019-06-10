import {
  pipe,
  get,
  when,
  deepEqual,
  findWith,
  upsert,
  remove,
  is,
} from "@asd14/m"

// check if item exists and is not expired
const isValid = item => is(item) && new Date() < item.validUntil

/**
 * Object type key based cache store
 *
 * @returns {Object}
 */
export const buildCacheStore = ({ ttl = 100 } = {}) => {
  let items = []

  return {
    get(key) {
      return pipe(
        findWith({ key: deepEqual(key) }),
        when(isValid, get("value"), item => {
          // if item exists, its expired
          if (is(item)) {
            items = remove(item)(items)
          }
        })
      )(items)
    },

    /**
     * Set value under key (chainable)
     *
     * @param  {string|number|Object}  key        Store under key
     * @param  {any}                   value      What to store
     *
     * @returns  {undefined}
     */
    set(key, value) {
      if (!is(key)) {
        throw new TypeError(
          `ReduxAllIsList: Cache can not store "${value}" under key "${key}"`
        )
      }

      items = upsert(key, {
        key,
        value,
        validUntil: new Date(new Date().getTime() + ttl),
      })(items)
    },

    clear() {
      items = []
    },
  }
}
