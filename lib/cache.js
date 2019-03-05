import {
  pipe,
  prop,
  ifThen,
  deepEqual,
  findBy,
  findIndexBy,
  remove,
  is,
} from "@leeruniek/functies"

// check if item exists and is not expired
const isValid = item => is(item) && new Date() < item.validUntil

// update if exists, add otherwise
const upsertBy = (filter, value, source) => {
  const result = [...source]
  const index = findIndexBy(filter)(source)

  if (index === -1) {
    result.push(value)
  } else {
    result.splice(index, 1, value)
  }

  return result
}

/**
 * Object type key based cache store
 *
 * @returns {Object}
 */
export const buildCacheStore = ({ ttl = 100 } = {}) => {
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
        ifThen(isValid, prop("value"), item => {
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
     * @returns  {CacheStore}  Cache store instance
     */
    set(key, value) {
      if (!is(key)) {
        throw new TypeError(
          `ReduxCollections: Cache can not store "${value}" under key "${key}"`
        )
      }

      items = upsertBy(
        key,
        {
          key,
          value,
          validUntil: new Date(new Date().getTime() + ttl),
        },
        items
      )

      return this
    },

    clear() {
      items = []

      return this
    },
  }
}
