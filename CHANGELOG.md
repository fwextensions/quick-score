# Changelog

## [0.0.13](https://github.com/fwextensions/quick-score/releases/tag/v0.0.13) - 2021-10-05

### Fixed

- Update `devDependencies` to the latest minor versions.
- Run npm audit fix to remove vulnerabilities.
- Update .travis.yml to enable partner queue builds.
- Add GitHub code analysis workflow.


## [0.0.12](https://github.com/fwextensions/quick-score/releases/tag/v0.0.12) - 2021-04-24

### Fixed

- Limit the number of loops inside the `quickScore()` function so that long, nearly-matching queries don't take too long before returning a 0 score.  Added `config.maxIterations` to control the number of loops.
- Update `devDependencies` to latest packages.


## [0.0.11](https://github.com/fwextensions/quick-score/releases/tag/v0.0.11) - 2021-03-26

### Added

- Passing an empty array in the `keys` parameter will cause all of the keys on an item to be cached and searched, without having to specify each one.
- Paths to nested keys in the `keys` array can be specified as arrays of strings, instead of a dot-delimited path in a single string.  Wrapping a single string in an array will cause any dots it contains to not be treated as a path. 
- A new `sortKey` option can be used to specify on which key to sort identically-scored items, if a key other than the first one in `keys` is desired.
- A new `scoreValue` field is returned in the results from `search()`, which provides the string pointed to be `scoreKey`.  This makes it easier to access the string when it's nested.


## [0.0.10](https://github.com/fwextensions/quick-score/releases/tag/v0.0.10) - 2021-01-02

### Added

- A new `transformString` option to the `QuickScore` constructor can be used to ignore diacritics and accents when searching.


### Fixed

- Update `devDependencies` to latest packages, fixing a vulnerability in jest.


## [0.0.9](https://github.com/fwextensions/quick-score/releases/tag/v0.0.9) - 2020-07-25

### Fixed

- Update `devDependencies` to latest packages.


## [0.0.8](https://github.com/fwextensions/quick-score/releases/tag/v0.0.8) - 2020-05-07

### Fixed

- Use the correct unpkg.com CDN URL in the readme.
- Highlight needing to access the methods through a global when loading the library via a `<script>` tag.  


## [0.0.7](https://github.com/fwextensions/quick-score/releases/tag/v0.0.7) - 2020-05-03

### Added

- Info about loading built files from unpkg.com to the readme.
- Add a test that doesn't pass a matches array to get the branch coverage to 100%.
- Added CHANGELOG.md.

### Fixed

- Update `devDependencies` to latest packages.
- Update node version in `.travis.yml` to latest.
- Update to rollup 2.0.


## [0.0.6](https://github.com/fwextensions/quick-score/releases/tag/v0.0.6) - 2020-01-19

### Fixed

- The correct match indices were not returned in some cases, since the whole `matches` array was getting cleared when `remainingScore` was 0 during a search.
- Update `devDependencies` to latest packages.


## [0.0.5](https://github.com/fwextensions/quick-score/releases/tag/v0.0.5) - 2019-10-19

### Fixed

- Update `devDependencies` to latest packages.


## [0.0.4](https://github.com/fwextensions/quick-score/releases/tag/v0.0.4) - 2019-05-27

### Fixed

- Update to babel 7, jest 24, and rollup 1.0.
- Update `devDependencies` to latest packages.


## [0.0.3](https://github.com/fwextensions/quick-score/releases/tag/v0.0.3) - 2019-05-27

### Added

- Support searching nested keys on objects use dot-delimited key names, like `"foo.bar"`.


## [0.0.2](https://github.com/fwextensions/quick-score/releases/tag/v0.0.2) - 2018-11-05

### Fixed

- Changed `prepare` script to `prepublishOnly`.


## [0.0.1](https://github.com/fwextensions/quick-score/releases/tag/v0.0.1) - 2018-11-05

### Added

- Initial release.
