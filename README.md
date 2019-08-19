<!-- markdownlint-disable first-line-h1 line-length -->

[![CircleCI](https://circleci.com/gh/asd14/redux-all-is-list.svg?style=svg)](https://circleci.com/gh/asd14/redux-all-is-list)
[![npm package version](https://badge.fury.io/js/%40asd14%2Fm.svg)](https://badge.fury.io/js/%40asd14%2Fredux-all-is-list)
[![dev-badge](https://david-dm.org/asd14/redux-all-is-list.svg)](https://david-dm.org/asd14/redux-all-is-list)
[![Coverage Status](https://coveralls.io/repos/github/asd14/redux-all-is-list/badge.svg)](https://coveralls.io/github/asd14/redux-all-is-list)

# redux-all-is-list

> A Redux data "gateway", similar to an API gateway. A less strict version of GraphQL, where you can have multiple data sources.

---

<!-- vim-markdown-toc GFM -->

* [Features](#features)
  * [Aggregate](#aggregate)
  * [Mitigate inconsistent API](#mitigate-inconsistent-api)
  * [Race free](#race-free)
  * [Cache](#cache)
  * [It's Redux](#its-redux)
* [Install](#install)
* [Example](#example)
* [API](#api)
  * [Definition](#definition)
    * [Params](#params)
    * [Retuns](#retuns)
  * [Internal state slice](#internal-state-slice)
  * [Add to Radux](#add-to-radux)
  * [Consume in container component](#consume-in-container-component)
  * [Selectors](#selectors)
* [Recommendations](#recommendations)
* [Develop](#develop)
* [Commit messages](#commit-messages)
* [Changelog](#changelog)

<!-- vim-markdown-toc -->

## Features

### Aggregate

> Combine data coming from different sources (users from own api, tweet count from Twitter)

### Mitigate inconsistent API

> Uniform into a common shape, ie. stop backend tech dept from propagating into the frontend

### Race free

> All CRUD operations are done in sequence. If `update` is issued after `delete`, the `update` promise will wait for `delete` to finish and then do it's work.

### Cache

> `find` operations are cached based on it's signature.

### It's Redux

> Treat your state data as simple lists with common metadata helpers (isLoading, isUpdating etc.) and less boilerplate.

## Install

```bash
npm install @asd14/redux-all-is-list
```

## Example

1:1 mapping of a Todo list's CRUD methods to corresponding API endpoints.

Define a list of todos from our local API.

```js
// todos.state.js

import { buildList } from "@asd14/redux-all-is-list"

export const TodosList = buildList({
  name: "PAGE__SECTION--TODOS",
  cacheTTL: 1000,
  methods: {
    create: data => POST("/todos", data),
    find: () => [{id: 1, title: "lorem ipsum"}],
    update: (id, data) => PATCH(`/todos/${id}`, date),
    delete: id => DELETE(`/todos/${id}`),
  },
})
```

Hook internal list reducers into the state store.

```js
// store.js

import { createStore, combineReducers } from "redux"
import { TodosList } from "./todos.state"

const store = createStore(
  combineReducers({
    [TodosList.name]: TodosList.reducer,
  }),
)
```

Use the list's selector helpers to access it's data.

```js
// todos.container.jsx

import React from "react"
import cx from "classnames"
import { connect } from "react-redux"

import { TodosList } from "./todos.state"

@connect(
  store => {
    const todosSelector = listSelector.selector(store)

    return {
      todos: todosSelector.items(),
      todosIsLoading: todosSelector.isLoading(),
    }
  },
  dispatch => ({
    xHandleTodosFind: TodosList.find(dispatch),
  })
)
class TodosContainer extends React.Component {
  componentDidMount = () => {
    const { xHandleTodosFind } = this.props

    xHandleTodosFind()
  }

  render = () => {
    const { todos, todosIsLoading } = this.props

    return (
      <div
        className={cx({
          [css.isLoading]: todosIsLoading,
        })}>
        {todos.map(item => <div>{item.title}</div>)}
      </div>
    )
  }
}

export { TodosContainer }
```

## API

### Definition

`buildList` is the only exposed function. It prepares the reducer and CRUD actions that interface and data sources.

```js
import { buildList } from "@asd14/redux-all-is-list"

buildList({
  name: "PAGE__SECTION--TODOS",
  cacheTTL: 100,
  methods: {
    create: data => POST("/todos", data),
    find: ({ offset, limit }) =>
      GET("/todos", {
        offset,
        limit,
      }),
    update: (id, data) => PATCH(`/todos/${id}`, date),
    delete: id => DELETE(`/todos/${id}`),
  },
})
```

#### Params

Object containing:

**`*name`**`:string`

Unique name used for the redux store key. If multiple lists use the same name, an error will be thrown. This is because the list is ment to be added on the root level of the redux store. Use [BEM](http://getbem.com/naming/) for naming, ex. `{page}__{section}--{entity}`

**`methods`**`:Object`

Define list's CRUD actions and map to one or more data sources (local storage, 3rd party APIs or own API). There are only 4 actions that can be defined.

* `.create(data: Object, { isDraft: bool = false }): Promise<Object>`
  * Add return obj to main `slice.items` - `id` field is required.  
  * Add data obj to `slice.creating` array, cleared after promise resolves.
  * Toggle `slice.isCreating` flag before and after promise resolves.  
  * If `isDraft` is true, the method will not run. The data object will be simply added to the `slice.items` array.
  * Clear cache if `cacheTTL` is set.

* `.find(...args: any[]): Promise<Object[]>`
  * Replace `slice.items` contents with return array - `id` field is required in each item.
  * Toggle `slice.isLoading` flag before and after promise resolves.
  * Set `slice.loadDate` to the current time (Date object) after promise resolves.
  * Results will be cached based on `args`. `find({offset: 10})` will be cached separately than `find()`.

* `update(id: string|number, data: Object, { isDraft: bool = false }): Promise<Object>`
  * Update item in `slice.items` if exists (merge by `id`), add otherwise.
  * Add item to `slice.updating` array, cleared after promise resolves.
  * If `isDraft` is true, the method will not run. The data object will be simply merged or added to the `slice.items` array.
  * Clear cache if `cacheTTL` is set.

* `delete: (id: string|number): Promise`
  * Delete item with `id`. Return value is ignored.
  * Clear cache if `cacheTTL` is set.

**`cacheTTL`**`: number`

Number of miliseconds a cached value is valid.

#### Retuns

Object containing:

**`name`**`:string` and **`reducer`**`:Function`

Map the same `name` passed in the builder function to the constructed reducer function specific each list. Use when initializing the store.

```js
import { createStore, combineReducers } from "redux"
import { TodosList } from "./todos.state"

const store = createStore(
  combineReducers({
    [TodosList.name]: TodosList.reducer,
  }),
)
```

**`create|find|update|delete`**`: (dispatch: Function): Function`

Curry function that make available the store's `dispatch` to the functions in `methods`. Error will be thrown if the method is not defined in builder function's `methods` obj.

```js
@connect(mapStateToProps, dispatch => ({
  xHandleTodosFind: TodosList.find(dispatch),
}))
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

### Add to Radux

### Consume in container component

### Selectors

* **`.head`**`: () => Object|undefined`
* **`.byId`**`: (id: string|number) => Object|undefined`
* **`.items`**`: () => Object[]`
* **`.creating`**`: () => Object[]`
* **`.updating`**`: () => Object[]`
* **`.deleting`**`: () => Object[]`
* **`.error`**`: (action: string) => Object`
* **`.isCreating`**`: () => boolean`
* **`.isLoaded`**`: () => boolean`
* **`.isLoading`**`: () => boolean`
* **`.isUpdating`**`: (id: string|number) => boolean`
* **`.isDeleting`**`: (id: string|number) => boolean`

## Recommendations

* Don't reuse. A list should be used once per page/section.
* Group all lists per page into a separate file to avoid variable name collision.
* Don't store data locally, data lives in the database - that's the real application state.

## Develop

```bash
git clone git@github.com:asd14/redux-all-is-list.git && \
  cd redux-all-is-list && \
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

See the [releases section](https://github.com/asd14/redux-all-is-list/releases) for details.
