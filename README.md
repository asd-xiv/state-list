<!-- markdownlint-disable first-line-h1 line-length -->

[![CircleCI](https://circleci.com/gh/mutantlove/redux-list.svg?style=svg)](https://circleci.com/gh/mutantlove/redux-list)
[![npm version](https://badge.fury.io/js/%40mutantlove%2Fredux-list.svg)](https://badge.fury.io/js/%40mutantlove%2Fredux-list)
[![dev-badge](https://david-dm.org/mutantlove/redux-list.svg)](https://david-dm.org/mutantlove/redux-list)
[![Coverage Status](https://coveralls.io/repos/github/mutantlove/redux-list/badge.svg)](https://coveralls.io/github/mutantlove/redux-list)

# redux-list

<!-- vim-markdown-toc GFM -->

* [Features](#features)
* [Install](#install)
* [Example](#example)
* [Enforce model shape using JSON Schemas](#enforce-model-shape-using-json-schemas)
* [Develop](#develop)
* [Commit messages](#commit-messages)
* [Changelog](#changelog)

<!-- vim-markdown-toc -->

## Features

* [x] **Aggregate**: Combine data coming from different sources (users from own api, tweet count from Twitter)
* [x] **Race free**: List operations are sequential. If `update` is issued after `delete`, the `update` promise will wait for `delete` to finish
* [x] **It's Redux**: Treat Redux state data as simple lists with common metadata helpers (isLoading, isUpdating etc.)
* [ ] **Real time**: WebSockets support

## Install

```bash
npm install @mutantlove/redux-list
```

## Example

`src/todos.list.js` - Define a list of Todos from our API.

```js
import { buildList } from "@mutantlove/redux-list"

const TodosList = buildList({
  /**
   * Unique name used as Redux store key. If multiple lists use the same
   * name, an error will be thrown.
   * List is ment to be added on the root level of the Redux store.
   *
   * Use BEM (getbem.com/naming) for naming, ex. `{page}__{section}--{entity}`
   */
  name: "PAGE__SECTION--TODOS",

  /**
   * Define CRUD actions and map the internal items to one or more data sources
   * (local storage, 3rd party APIs or own API).
   *
   * Only 5 actions can be defined: `create`, `read`, `readOne`, `update` and
   * `remove`. These have internaly 3 reducers each: onStart, onEnd and onError.
   */
  create: data =>
    POST("/todos", data),

  read: () =>
    GET("/todos"),

  readOne: id =>
    GET("/comments", {
      query: { todoId: id },
    }).then(result => ({
      id,
      comments: result,
    })),

  update: (id, data) =>
    PATCH(`/todos/${id}`, date),

  remove: id =>
    DELETE(`/todos/${id}`),

  /**
   * Transformer function applyed on all list items before reducers update
   * state. Triggered on all method calls (create, read, readOne, update and
   * remove).
   *
   * Use for enforcing common transformations on external data, sorting,
   * JSON Schema checks etc.
   *
   * @param {Object[]} items All items inside list internal array
   */
  onChange: items => sortBy(prop("priority"), items)
})

export { TodosList }
```

`src/store.js` - Hook internal list reducers into the state store.

```js
import { createStore, combineReducers } from "redux"
import { TodosList } from "./todos.state"

const store = createStore(
  combineReducers({
    [TodosList.name]: TodosList.reducer,
  }),
)
```

`src/use-app-list.js` - Hook to simplify usage in Container components

```js
import { useDispatch, useSelector } from "react-redux"
import { useList as useMutantList } from "@mutantlove/redux-list"

const useList = list => {
  const dispatch = useDispatch()
  const { selector, ...rest } = useMutantList(list, dispatch)

  return {
    selector: useSelector(selector),
    ...rest,
  }
}

export { useList }
```

`src/todos.container.jsx` - Use list's selector to access the data

```js
import React from "react"
import cx from "classnames"

import { useList } from "./use-list"
import { TodosList } from "./todos.state"

const TodosContainer = () => {
  const {
    selector: { items, isLoading },
  } = useList(TodosList)

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

## Enforce model shape using JSON Schemas

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
