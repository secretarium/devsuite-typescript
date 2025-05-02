# Changelog
## [0.19.0](https://github.com/secretarium/devsuite-typescript/compare/connector@0.18.0...connector@0.19.0) (2025-05-02)


### ⚠ BREAKING CHANGES

* Moving to pure ESM repo

### Features

* **connector:** Adding chunking support for large payloads ([fefed41](https://github.com/secretarium/devsuite-typescript/commit/fefed41e2c95243ec90cddb7cc58d69fad7d073f))
* **connector:** Adding gateway detection handling ([0be1c96](https://github.com/secretarium/devsuite-typescript/commit/0be1c968733b65301d58608ea15d52d9d07ba04e))
* **connector:** Implement experimental support for local broadcast channels ([aebd266](https://github.com/secretarium/devsuite-typescript/commit/aebd266ae25c5a1462f639e2e8eeaf914fd9c32f))


### Bug Fixes

* **connector:** Fix payload chunking algo ([e203b1c](https://github.com/secretarium/devsuite-typescript/commit/e203b1c5f81acf30211df2e995769065664f6d48))
* **crypto,connector:** Ensure compatibility with ESM ([9bfdea6](https://github.com/secretarium/devsuite-typescript/commit/9bfdea6ec6f31a9783c4501165586be30300c9c7))


### Miscellaneous Chores

* Moving to pure ESM repo ([0c9c230](https://github.com/secretarium/devsuite-typescript/commit/0c9c2301e3a8c009872cf3d5afee290f1ad3eb44))

## [0.18.0](///compare/connector@0.16.0...connector@0.18.0) (2025-04-07)

### Features

* **connector:** Adding chunking mechanics for large payload 5726a0ee

## [0.17.0](///compare/connector@0.16.1...connector@0.17.0) (2024-02-29)

### Dependency Updates

* `crypto` updated to version `0.16.1`

### Features

* **connector:** Remove requirement for entering server trusted key 5682a45

## [0.16.1](///compare/connector@0.16.0...connector@0.16.1) (2023-12-20)

## [0.16.0](///compare/connector@0.15.0...connector@0.16.0) (2023-12-20)

### Features

* **connector:** Provide better type casting for SCP methods 9a46ac1

## [0.14.0](///compare/connector@0.13.5...connector@0.14.0) (2023-11-22)

### Dependency Updates

* `crypto` updated to version `0.13.5`

### Features

* **connector:** Add endpoint and connection status call to SCP 30f945a
* **crypto,connector:** Provide NodeJS Subtle export + Context info 097cc8d

### Bug Fixes

* **connector:** Forcefully remove `alg` from imported keys to work on Node Subtle fb950a8

## [0.14.0](///compare/connector@0.13.5...connector@0.14.0) (2023-11-21)

### Dependency Updates

* `crypto` updated to version `0.13.5`

### Features

* **connector:** Add endpoint and connection status call to SCP 30f945a

## [0.13.5](///compare/connector@0.13.4...connector@0.13.5) (2023-10-06)

### Bug Fixes

* **connector:** Change backing socket targeting 8c6fe7e

## [0.13.4](///compare/connector@0.13.3...connector@0.13.4) (2023-10-05)

### Dependency Updates

* `crypto` updated to version `0.13.3`

### ⚠ BREAKING CHANGES

* Remove Klave packages

### Miscellaneous Chores

* Remove Klave packages 6515eea

## [0.13.3](///compare/connector@0.13.2...connector@0.13.3) (2023-09-27)

### Dependency Updates

* `crypto` updated to version `0.13.2`

### Bug Fixes

* Revert change to package.json generation until Nx 17 0d72132

## [0.13.2](///compare/connector@0.13.1...connector@0.13.2) (2023-09-01)

### Dependency Updates

* `crypto` updated to version `0.13.1`

## [0.13.1](///compare/connector@0.13.0...connector@0.13.1) (2023-06-01)

### Dependency Updates

* `crypto` updated to version `0.1.2`

## [0.13.0](///compare/connector@0.12.4...connector@0.13.0) (2023-05-16)

### Dependency Updates

* `crypto` updated to version `0.1.1`

### Features

* New Instrumentation package with Sentry compat 3fbde7d
