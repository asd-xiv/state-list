<!-- markdownlint-disable first-line-h1 line-length -->

[![npm package version](https://badge.fury.io/js/%40asd14%2Fm.svg)](https://badge.fury.io/js/%40asd14%2Fredux-all-is-list)
[![dev-badge](https://david-dm.org/asd14/redux-all-is-list.svg)](https://david-dm.org/asd14/redux-all-is-list)
[![Coverage Status](https://coveralls.io/repos/github/asd14/redux-all-is-list/badge.svg)](https://coveralls.io/github/asd14/redux-all-is-list)

# redux-all-is-list

> Reduce Redux boilerplate when mapping API data

---

<!-- vim-markdown-toc GFM -->

* [Install](#install)
* [Use](#use)
* [Develop](#develop)
* [Changelog](#changelog)
  * [0.5 - 16 April 2019](#05---16-april-2019)
    * [Add](#add)
    * [Change](#change)

<!-- vim-markdown-toc -->

## Install

```bash
npm i @asd14/redux-all-is-list
```

## Use

`todos.state.js`

```js
import { buildList } from "@asd14/redux-all-is-list"

export const TodosList = buildList({
  name: "SOME-PAGE__WHATEVER-SECTION__TODOS",
  methods: {
    create: data => POST("/todos", data),
    find: () => [{id: 1, title: "lorem ipsum"}],
    update: (id, data) => PATCH(`/todos/${id}`, date),
    delete: id => DELETE(`/todos/${id}`),
  },
})
```

`store.js`

```js
import { createStore, combineReducers } from "redux"
import { TodosList } from "./todos.state"

const store = createStore(
  combineReducers({
    [TodosList.name]: TodosList.reducer,
  }),
)
```

`todos.container.jsx`

```js
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
          [css.loading]: todosIsLoading,
        })}>
        {todos |> map(todo => <div>{todo.title}</div>)}
      </div>
    )
  }
}

export { TodosContainer }
```

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

## Changelog

History of all changes in [CHANGELOG.md](CHANGELOG.md)

### 0.5 - 16 April 2019

#### Add

* Tests for list `.add()` and `.clear()`
* Selector `.error()` function for getting lastest error
* Cache support added via `cacheTTL`

#### Change

* List `.create` accepts multiple items
* Multiple calls to the same method at the same time will only trigger once
* Method calls are sequential and will be wait on any previous ones to finish
