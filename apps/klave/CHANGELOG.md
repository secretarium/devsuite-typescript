# Changelog
## [0.2.0](///compare/klave@0.1.0...klave@0.2.0) (2023-06-06)

### Dependency Updates

* `klave-api` updated to version `0.2.0`

### Features

* **db,api,klave:** Add support for Webauthn enrollement 85aabab

## 0.1.0 (2023-06-01)

### Dependency Updates

* `klave-api` updated to version `0.1.0`
* `crypto` updated to version `0.1.2`
* `connector` updated to version `0.13.1`
* `instrumentation` updated to version `0.1.1`

### Features

* Add run command screen to the deployments view 8b7095f
* **db,api,klave:** Provide feedback Klave has no GitHub App access 2d9bfa2
* **hubber-api,hubber,klave:** Add capture of `expiresOn` date for deployments 663f854
* **hubber-api,klave:** Implement SCP node info fetching from backend 60d1f8a
* **hubber,klave:** Add output storage and route extraction a7ac061
* Implement identity and web merging 1e16538
* **klave:** Add new setup reception page for app installation 0951d99
* **klave:** Add repository information in the Application settings page f1580b2
* **klave:** Add SHA256 computation of the contract base64 07bdf95
* **klave:** Making application deletion safer 7c1bda2
* New Instrumentation package with Sentry compat 3fbde7d


### Bug Fixes

* **hubber,klave:** Resolve Secretarium URI and key exposition dae9c79
* **klave:** Display error message on /deploy/select route screen fdec8a0
* **klave:** Form submission would trigger double submission d4c9401
* **klave:** Issue with wrong state in the query builder console c163867
* **klave:** Pause the user flow to wait for the repository to be ready d66a28b
* **klave:** Websocket protocol targeting 5ab8486


### Reverts

* Revert "chore(klave): Move to vite for compiling/bundling" 8edc593
