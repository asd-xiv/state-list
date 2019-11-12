<!-- markdownlint-disable first-line-h1 line-length -->

[![CircleCI](https://circleci.com/gh/mutantlove/redux-list.svg?style=svg)](https://circleci.com/gh/mutantlove/redux-list)
[![npm version](https://badge.fury.io/js/%40mutantlove%2Fredux-list.svg)](https://badge.fury.io/js/%40mutantlove%2Fredux-list)
[![dev-badge](https://david-dm.org/mutantlove/redux-list.svg)](https://david-dm.org/mutantlove/redux-list)
[![Coverage Status](https://coveralls.io/repos/github/mutantlove/redux-list/badge.svg)](https://coveralls.io/github/mutantlove/redux-list)

# redux-list

> Treat all state slices as lists with a standard structure and behaviour

---

<!-- vim-markdown-toc GFM -->

* [Features](#features)
* [Install](#install)
* [Example](#example)
* [API](#api)
  * [Internal state slice](#internal-state-slice)
* [Develop](#develop)
* [Commit messages](#commit-messages)
* [Changelog](#changelog)

<!-- vim-markdown-toc -->

## Features

* **Aggregate**: Combine data coming from different sources (users from own api, tweet count from Twitter)
* **Race free**: All CRUD operations are done in sequence. If `update` is issued after `delete`, the `update` promise will wait for `delete` to finish
* **It's Redux**: Treat your Redux state data as simple lists with common metadata helpers (isLoading, isUpdating etc.).

## Install

```bash
npm install @mutantlove/redux-list
```

## Example

1:1 mapping of a Todo list's CRUD methods to corresponding API endpoints.

`src/todos.list.js` - Define a list of Todos from our API.

```js
import { buildList } from "@mutantlove/redux-list"

const TodosList = buildList("PAGE__SECTION--TODOS", {
  create: data => POST("/todos", data),
  read: () => [{id: 1, title: "lorem ipsum"}],
  readOne: () => {
    id: 1,
    title: "lorem ipsum",
    body: "extended data that you dont need the first time around"
  },
  update: (id, data) => PATCH(`/todos/${id}`, date),
  delete: id => DELETE(`/todos/${id}`),
})

export {TodosList}
```

---

`store.js` - Hook internal list reducers into the state store.

```js
import { createStore, combineReducers } from "redux"
import { TodosList } from "./todos.state"

const store = createStore(
  combineReducers({
    [TodosList.name]: TodosList.reducer,
  }),
)
```

---

`todos.container.jsx` - Use the list's selector helpers to access the data.

```js
import React from "react"
import cx from "classnames"
import { useDispatch, useSelector } from "react-redux"
import { useList } from "@mutantlove/redux-list"

import { TodosList } from "./todos.state"

/**
 * Helper hook to reduce the number of imports
 */
const useLocalList = list => {
  const dispatch = useDispatch()
  const { selector, ...actions } = useList(list, dispatch)

  return {
    selector: useSelector(selector),
    ...actions,
  }
}

const TodosContainer = () => {
  const {
    selector: { items, isLoading },
  } = useLocalList(TodosList)

  return (
    <div
      className={cx({
        [css["todo--is-loading"]]: isLoading(),
      })}>
      {items().map(({ id, title }) => (
        <div key={id}>{title}</div>
      ))}
    </div>
  )
}

export { TodosContainer }
```

## API

```js
const { buildList } from "@mutantlove/redux-list"

buildList(
  /**
   * Unique name used as Redux store key. If multiple lists use the same
   * name, an error will be thrown.
   * This is because the list is ment to be added on the root level of
   * the store.
   *
   * Use BEM (getbem.com/naming) for naming, ex. `{page}__{section}--{entity}`
   */
  "PROFILE__LATEST--WRITTEN-ARTICLES",

  /**
   * Define list's CRUD actions and map to one or more data sources (local
   * storage, 3rd party APIs or own API). There are only 4 actions that can
   * be defined: `create`, `read`, `update` and `delete`.
   */
  {
  /**
   * Create
   *
   * Redux actions will be dispatched before and after the method call.
   * `${name}_CREATE_START` before and `${name}_CREATE_SUCCESS` or
   * `${name}_CREATE_ERROR` after, depending if method throws an error.
   *
   * @param {Object} data     An `id` field must be present
   * @param {Object} options  If called with `isDraft` option set to true,
   *                          this method will not run. The data object will
   *                          simply be added `slice.items`.
   *
   * @returns Object | Promise<Object>
   */
  create: (data, options, ...rest) => {
    return {
      id: "uuid",
    }
  }

  read: (...rest) => {
  },

  readOne: (id, options, ...rest) => {
  },

  update: (id, data, options, ...rest) => {
  },

  delete: (id, options, ...rest) => {
  }
})
```

### Internal state slice

```js
{
  ...
  [list.name] : {
    items: [],
    creating: [],
    updating: [],
    deleting: [],
    errors: {},
    loadDate: null,
    isLoading: false,
  }
}
```

## Develop

```bash
git clone git@github.com:mutantlove/redux-list.git && \
  cd redux-list && \
  npm run setup
```

Run all `*.test.js` in `src` folder

```bash
npm test
```

Watch `src` folder for changes and re-run tests

```bash
npm run tdd
```

## Commit messages

Using Angular's [conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).

```text
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
BREAKING CHANGE: Half of features not working anymore
```

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing or correcting existing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

## Changelog

See the [releases section](https://github.com/mutantlove/redux-list/releases) for details.
