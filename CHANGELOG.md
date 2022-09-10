# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.3] - 2022-09-10
### Added
- Support for comment blocks

## [1.1.2] - 2022-06-29
### Changed
- Terminate the processs with exit code 1 in case of an error

## [1.1.1] - 2022-06-29
### Added
- Dockerfile to build a ready-to-use image
- docker-compose.production.yml for automatic building

## [1.1.0] - 2022-06-28
### Added
- Line indicator for error messages
- New option `-c` (or `--changes`) to retrieve the content of the latest release
- Extended validation (EmptyReleaseError, UngroupedTypeError, MissingTypeError, EmptyTypeError)
- Tests

## [1.0.0] - 2022-06-27
### Added
- Initial release

[Unreleased]: https://github.com/wesone/chap/compare/v1.1.3...HEAD
[1.1.3]: https://github.com/wesone/chap/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/wesone/chap/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/wesone/chap/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/wesone/chap/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/wesone/chap/releases/tag/v1.0.0
