<!-- markdownlint-disable no-duplicate-header line-length -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6] - 12 June 2019

### Change

* `.delete()` and `.update()` uses "id" parameter to identify element. If method retuns "id" field, it will take precedence.

## [0.5.1] - 18 April 2019

### Remove

* `.add()` builtin method

### Chage

* `.create()` and `.update()` has a `isDraft` option that when true only creates/updates the local state without running the respective methods. Methods still need to be defined

## [0.5] - 16 April 2019

### Add

* Tests for list `.add()` and `.clear()`
* Selector `.error()` function for getting lastest error
* Cache support added via `cacheTTL`

### Change

* List `.create` accepts multiple items
* Multiple calls to the same method at the same time will only trigger once
* Method calls are sequential and will be wait on any previous ones to finish

## [0.3.0] - 29 December 2018

### Add

* Tests for selector

### Change

* Resolve API call inside action. List methods no longer needs to explicitly return a Promise.

## [0.2.2] - 9 December 2018

### Change

* Fix `isLoaded` selector not checking corect date property

## [0.2.0] - 8 December 2018

### Add

* Add state selector to [`buildList`](src/index.js#L57) export
* Add test for [`create`](src/create/create.test.js), [`find`](src/find/find.test.js), [`update`](src/update/update.test.js) and [`delete`](src/delete/delete.test.js) actions

## [0.1.0] - 26 November 2018

First

[Unreleased]: https://github.com/asd14/redux-all-is-list/compare/v0.6...HEAD

[0.6]: https://github.com/asd14/redux-all-is-list/compare/v0.5.1...v0.6
[0.5.1]: https://github.com/asd14/redux-all-is-list/compare/v0.5...v0.5.1
[0.5]: https://github.com/asd14/redux-all-is-list/compare/v0.3.0...v0.5
[0.3.0]: https://github.com/asd14/redux-all-is-list/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/asd14/redux-all-is-list/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/asd14/redux-all-is-list/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/asd14/redux-all-is-list/compare/v0.1.0
