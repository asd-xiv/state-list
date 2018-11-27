[![npm package version](https://badge.fury.io/js/%40asd14%2Fm.svg)](https://badge.fury.io/js/%40asd14%2Fredux-all-is-list)
[![dev-badge](https://david-dm.org/asd14/redux-all-is-list.svg)](https://david-dm.org/asd14/redux-all-is-list)
[![Coverage Status](https://coveralls.io/repos/github/asd14/redux-all-is-list/badge.svg)](https://coveralls.io/github/asd14/redux-all-is-list)

# redux-all-is-list

> Omelette du fromage, omelette du fromage, all state is list

---

<!-- MarkdownTOC levels="1,2,3" autolink="true" indent="  " -->

- [Install](#install)
- [Use](#use)
- [Develop](#develop)
- [Changelog](#changelog)
  - [\[0.1.0\] - 26 November 2018](#010---26-november-2018)

<!-- /MarkdownTOC -->

## Install

```bash
npm i --save-exact @asd14/redux-all-is-list
```

## Use

```js
// totos.state.js
//
import { buildList } from "@asd14/redux-all-is-list"

export const TodosList = buildList({
  name: "SOME-PAGE__TODOS",
  methods: {
    create: data => POST("/todos", data),
    find: () => GET("/todos"),
    update: (id, data) => PATCH(`/todos/${id}`, date),
    delete: id => DELETE(`/todos/${id}`),
  },
})
```

```js
// store.js
//
import { createStore, combineReducers } from "redux"
import { TodosList } from "./todos.state"

const store = createStore(
  combineReducers({
    [TodosList.name]: TodosList.reducer,
  }),
)
```

```js
// todos.container.jsx
//
import React from "react"
import cx from "classnames"
import { connect } from "react-redux"
import { listSelector } from "@asd14/redux-all-is-list"

import { TodosList } from "./todos.state"

@connect(
  store => {
    const todosSelector = listSelector(store[TodosList.name])

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
        {todos |> map(todo => <div>{todo.name}</div>)}
      </div>
    )
  }
}
```

## Develop

```bash
git clone git@github.com:asd14/redux-all-is-list.git && \
  cd redux-all-is-list && \
  npm run setup

# run tests (any `*.test.js`) once
npm test

# watch `src` folder for changes and run test automatically
npm run tdd
```

## Changelog

History of all changes in [CHANGELOG.md](CHANGELOG.md)

### [0.1.0] - 26 November 2018

First
