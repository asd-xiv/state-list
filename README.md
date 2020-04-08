<!-- markdownlint-disable first-line-h1 line-length -->

[![CircleCI](https://circleci.com/gh/mutant-ws/redux-list.svg?style=svg)](https://circleci.com/gh/mutant-ws/redux-list)
[![npm version](https://badge.fury.io/js/%40mutant-ws%2Fredux-list.svg)](https://badge.fury.io/js/%40mutant-ws%2Fredux-list)
[![dev-badge](https://david-dm.org/mutant-ws/redux-list.svg)](https://david-dm.org/mutant-ws/redux-list)
[![Coverage Status](https://coveralls.io/repos/github/mutant-ws/redux-list/badge.svg)](https://coveralls.io/github/mutant-ws/redux-list)

# redux-list

<!-- vim-markdown-toc GFM -->

* [Features](#features)
* [Easy to integrate with](#easy-to-integrate-with)
* [Install](#install)
* [Example](#example)
* [Enforce model shape using JSON Schemas](#enforce-model-shape-using-json-schemas)
* [Develop](#develop)
* [Commit messages](#commit-messages)
* [Changelog](#changelog)

<!-- vim-markdown-toc -->

## Features

* [x] **Backend agnostic**: Combine data coming from different sources (users from own api, tweet count from Twitter)
* [x] **Race free**: List operations are sequential. If `update` is issued after `delete`, the `update` promise will wait for `delete` to finish
* [x] **It's Redux**: Treat Redux state data as simple lists with common metadata helpers (isLoading, isUpdating etc.)

## Easy to integrate with

* [x] **Real time updates**
* [z] **Model validation**

## Install

```bash
npm install @mutant-ws/redux-list
```

## Example

`src/todos.list.js` - Define a list of Todos from our API.

```js
import { buildList } from "@mutant-ws/redux-list"

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

const useList = list => {
  // List actions dispatch to Redux store
  list.setDispatch(useDispatch())

  return {
    selector: useSelector(list.selector),
    create: list.create,
    read: list.read,
    readOne: list.readOne,
    update: list.update,
    remove: list.remove,
    clear: list.clear,
  }
}

export { useList }
```

`src/todos.container.jsx` - Use list's selector to access the data

```js
import React, { useEffect } from "react"
import cx from "classnames"

import { useList } from "./use-list"
import { TodosList } from "./todos.state"

const TodosContainer = ({ projectId }) => {
  const {
    selector: { items, isLoading },
    read
  } = useList(TodosList)

  // data fetching
  useEffect(() => {
    read({ projectId })
  }, [projectId, read])

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
git clone git@github.com:mutant-ws/redux-list.git && \
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

See the [releases section](https://github.com/mutant-ws/redux-list/releases) for details.
