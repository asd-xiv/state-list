[![npm package version](https://badge.fury.io/js/%40asd14%2Fm.svg)](https://badge.fury.io/js/%40asd14%2Fredux-all-is-list)
[![dev-badge](https://david-dm.org/asd14/redux-all-is-list.svg)](https://david-dm.org/asd14/redux-all-is-list)
[![Coverage Status](https://coveralls.io/repos/github/asd14/redux-all-is-list/badge.svg)](https://coveralls.io/github/asd14/redux-all-is-list)

# redux-all-is-list

> Reduce Redux boilerplate when mapping data from API endpoints.

---

<!-- MarkdownTOC levels="1,2,3" autolink="true" indent="  " -->

- [Install](#install)
- [Use](#use)
- [Develop](#develop)
- [Changelog](#changelog)
  - [0.2.2 - 9 December 2018](#022---9-december-2018)

<!-- /MarkdownTOC -->

## Install

```bash
npm i --save-exact @asd14/redux-all-is-list
```

## Use

`todos.state.js`

```js
import { buildList } from "@asd14/redux-all-is-list"

export const TodosList = buildList({
  name: "SOME-PAGE__WHATEVER-SECTION__TODOS",
  methods: {
    create: data => POST("/todos", data),
    find: () => GET("/todos"),
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
        {todos |> map(todo => <div>{todo.name}</div>)}
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

# run tests (any `*.test.js`) once
npm test

# watch `src` folder for changes and run test automatically
npm run tdd
```

## Changelog

History of all changes in [CHANGELOG.md](CHANGELOG.md)

### 0.2.2 - 9 December 2018

#### Change

- Fix `isLoaded` selector not checking corect date property
