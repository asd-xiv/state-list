import {
  pipe,
  get,
  when,
  deepEqual,
  findBy,
  upsertBy,
  remove,
  is,
} from "@asd14/m"

// Helper section, keep is short and pure
const isValid = item => is(item) && new Date() < item.validUntil

/**
 * Object type key based cache store
 *
 * @returns {Object}
 */
export const buildCacheStore = () => {
  let items = []

  return {
    /**
     * Get value under key
     *
     * @param  {string|number|Object}  key  Search key
     *
     * @returns  {mixed|undefined}  Stored value if key exists and not expired
     */
    get(key) {
      return pipe(
        findBy({ key: deepEqual(key) }),
        when(isValid, get("value"), item => {
          if (is(item)) {
            // remove if expired
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
     * @param  {Object}                props      Config options
     * @param  {number}                props.ttl  Valid duration (milliseconds)
     *
     * @returns  {CacheStore}  Cache store instance
     */
    set(key, value, { ttl = 500 } = {}) {
      if (!is(key)) {
        throw new TypeError(
          `ReduxAllIsList: Cache can not store "${value}" under key "${key}"`
        )
      }

      items = upsertBy(key, {
        key,
        value,
        validUntil: new Date(new Date().getTime() + ttl),
      })(items)

      return this
    },

    clear() {
      items = []

      return this
    },
  }
}
