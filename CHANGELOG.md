# Changelog

## [0.0.9] - 2020-07-25

### Fixed

- Update `devDependencies` to latest packages.


## [0.0.8] - 2020-05-07

### Fixed

- Use the correct unpkg.com CDN URL in the readme.
- Highlight needing to access the methods through a global when loading the library via a `<script>` tag.  


## [0.0.7] - 2020-05-03

### Added

- Info about loading built files from unpkg.com to the readme.
- Add a test that doesn't pass a matches array to get the branch coverage to 100%.
- Added CHANGELOG.md.

### Fixed

- Update `devDependencies` to latest packages.
- Update node version in .travis.yml to latest.
- Update to rollup 2.0.


## [0.0.6] - 2020-01-19

### Fixed

- The correct match indices were not returned in some cases, since the whole `matches` array was getting cleared when `remainingScore` was 0 during a search.
- Update `devDependencies` to latest packages.


## [0.0.5] - 2019-10-19

### Fixed

- Update `devDependencies` to latest packages.


## [0.0.4] - 2019-05-27

### Fixed

- Update to babel 7, jest 24, and rollup 1.0.
- Update `devDependencies` to latest packages.


## [0.0.3] - 2019-05-27

### Added

- Support searching nested keys on objects use dot-delimited key names, like `"foo.bar"`.


## [0.0.2] - 2018-11-05

### Fixed

- Changed `prepare` script to `prepublishOnly`.


## [0.0.1] - 2018-11-05

### Added

- Initial release.
