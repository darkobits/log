## [1.3.0-beta.1](https://github.com/darkobits/log/compare/v1.2.3...v1.3.0-beta.1) (2024-12-01)

### ⚠ BREAKING CHANGES

* Due to the significance of this re-write, this update will entail a major version bump.

### ✨ Features

* Add `createPipe`. ([d867833](https://github.com/darkobits/log/commit/d8678332f97155a8ec7731049627e221a53d70df))
* Add new logger. ([5080695](https://github.com/darkobits/log/commit/50806954f42325b0cf86cbf71638ab92fee361f2))
* Add spinners, timers, secrets masking. ([d31c512](https://github.com/darkobits/log/commit/d31c512fd8bbade4fbe21339c503bbaca800d19d))
* Allow stream to be set to `false`. ([b1122bf](https://github.com/darkobits/log/commit/b1122bf87354f8b034f26932fa724ecbd3be64d9))
* Disable interactive sessions in CI environments. ([b1d1568](https://github.com/darkobits/log/commit/b1d156805cb2f45c2e9e6299735e9246d069c6b7))
* Restore LogPipe helper. ([9b2b7dc](https://github.com/darkobits/log/commit/9b2b7dc2b1de4cff3443edb164519010376616a2))

### 🐞 Bug Fixes

* Fix logging during interactive sessions. ([c65ae1a](https://github.com/darkobits/log/commit/c65ae1a672d3f3d07158463c4cbf52527842b6af))
* Fix typing for streams. ([8e21708](https://github.com/darkobits/log/commit/8e21708a087c4c6f5a5b680019847c088d2d5841))
* Update log levels. ([1dd3594](https://github.com/darkobits/log/commit/1dd3594134f3bb1f1b897dc1a6d28252bf786a43))
* Update log levels. ([85945c8](https://github.com/darkobits/log/commit/85945c88677db06c4be3c4f238db98164a936ce0))

### 🏗 Chores

* Add ci.yml. ([03b79cb](https://github.com/darkobits/log/commit/03b79cbd1354a9974e24682a65a32f24967c1870))
* **deps:** Update dependencies. ([7e106e9](https://github.com/darkobits/log/commit/7e106e9bbbb1197b34f4beaa14a44533b3489e27))
* **deps:** Update dependencies. ([0af4095](https://github.com/darkobits/log/commit/0af4095b40bb27b4876b0f9c190c8e5dfe7b4d07))
* Fix linting errors. ([5a136d7](https://github.com/darkobits/log/commit/5a136d78d67da0ecf22ba57188b3a0ea84f0439e))
* Migrate to Travis CI. ([a29e107](https://github.com/darkobits/log/commit/a29e1071b7450fb8ea862319edbabbbc0e22aab4))
* **release:** 2.0.0-beta.0 ([8dfe864](https://github.com/darkobits/log/commit/8dfe8646b6d9035b9464c5335a8d8406b95e076b))
* **release:** 2.0.0-beta.1 ([2d09848](https://github.com/darkobits/log/commit/2d09848a64764afd2f23fba274e19b9bbeae38cf))
* **release:** 2.0.0-beta.10 ([f6799b5](https://github.com/darkobits/log/commit/f6799b586bf0775cf26bb4cb05ffe46f86cde91b))
* **release:** 2.0.0-beta.11 ([8991f34](https://github.com/darkobits/log/commit/8991f34b49cc4faf4e7539574c745ed51cc68b8b))
* **release:** 2.0.0-beta.12 ([958ba22](https://github.com/darkobits/log/commit/958ba221da1853cf8d8ee8caec161742e79632a3))
* **release:** 2.0.0-beta.13 ([b250b78](https://github.com/darkobits/log/commit/b250b786cabc3a3b32e21de07a4e7ccafbcd5afe))
* **release:** 2.0.0-beta.14 ([dfe1fb5](https://github.com/darkobits/log/commit/dfe1fb591b5fdaa10d1fb9fda25108974060f5e7))
* **release:** 2.0.0-beta.15 ([642272d](https://github.com/darkobits/log/commit/642272d1e6a6d0e75a7e67415f380ee9b446834f))
* **release:** 2.0.0-beta.16 ([4e97731](https://github.com/darkobits/log/commit/4e9773171b73df1c330d44842e5d6fdfab453239))
* **release:** 2.0.0-beta.17 ([1a40076](https://github.com/darkobits/log/commit/1a40076e1e5238bd0f58832a0b6feb5008ef9691))
* **release:** 2.0.0-beta.2 ([9dc3866](https://github.com/darkobits/log/commit/9dc38661dd3e194e847df672bf4739c3118c88f5))
* **release:** 2.0.0-beta.3 ([3449b8c](https://github.com/darkobits/log/commit/3449b8c5c99529a0d90bb18adccac96227fac3cc))
* **release:** 2.0.0-beta.4 ([3cda309](https://github.com/darkobits/log/commit/3cda309c4dc29f0ec87f205db45b8ecd277b7a92))
* **release:** 2.0.0-beta.5 ([162188f](https://github.com/darkobits/log/commit/162188fbe0caa20f3300dcfa783b8015c751c1c2))
* **release:** 2.0.0-beta.6 ([09fbb77](https://github.com/darkobits/log/commit/09fbb77666bf21a7beaceb34fd4408ea292d5360))
* **release:** 2.0.0-beta.7 ([a388124](https://github.com/darkobits/log/commit/a388124a62cfdafc9896d73113fb526705ba9f55))
* **release:** 2.0.0-beta.8 ([1b653cf](https://github.com/darkobits/log/commit/1b653cf189a604ddfbb098c375099723b06aa570))
* **release:** 2.0.0-beta.9 ([e94654c](https://github.com/darkobits/log/commit/e94654c3395b1118c176a31d0dc35e990101f533))
* Remove old source files, update dependencies. ([f507ead](https://github.com/darkobits/log/commit/f507eadbaaa96a923ec7c193b1aa49466d13d18a))
* Tweak colors, add debug level. ([b92917f](https://github.com/darkobits/log/commit/b92917fb31e1b6d8889c45b1308934697db42ee3))
* Update .gitignore. ([dcaafa5](https://github.com/darkobits/log/commit/dcaafa516fe863f7956555b60299c25b5209e100))
* Update default configuration. ([aa1ab14](https://github.com/darkobits/log/commit/aa1ab14190b1ce998c23ad8e1e73561a875cd235))
* Update default style. ([b97676e](https://github.com/darkobits/log/commit/b97676ea4294b120d8c74ebaca5084e51dd58630))
* Update dependencies. ([28cc2f2](https://github.com/darkobits/log/commit/28cc2f21b2d77193e7a0393b2fb5bb1bdbec59f8))
* Update dependencies. ([2192eaa](https://github.com/darkobits/log/commit/2192eaae53b86e0de4eb43bcb3319d6fd6b595c1))
* Update dependencies. ([5a6e2dd](https://github.com/darkobits/log/commit/5a6e2dd06c9a6bc15fef981e9295f4dda0d03885))

### 📖 Documentation

* Update README. ([20d5148](https://github.com/darkobits/log/commit/20d514844ff6bb22aa26d12fd6646077223ccaa6))
* Update README. ([b3d8564](https://github.com/darkobits/log/commit/b3d85646f3d6dd066d150bba5d1f68b5da4608d1))
* Update README. ([b20cfb0](https://github.com/darkobits/log/commit/b20cfb0a465e87c8b0cea4e14ae10f8103d8cfa8))
* Update README. ([bcf4a03](https://github.com/darkobits/log/commit/bcf4a0340c8b42f7d5b6618c68c8156bd864e7fc))
* Update README.md. ([6d6df93](https://github.com/darkobits/log/commit/6d6df93843eb253f3c249116f7dd25bec6442634))

### 🛠 Refactoring

* Improve interactive logging. ([238023b](https://github.com/darkobits/log/commit/238023b309eb3276a61ece8ffcfc49b43574246f))
* Refactor logger. ([14a8bc6](https://github.com/darkobits/log/commit/14a8bc61c961b2f66b26bff3475f76a438fd998e))
* Remove 'npmlog' dependency. ([f0dab2c](https://github.com/darkobits/log/commit/f0dab2c53123bb03a8126086c46d6d4568b74397))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0-beta.17](https://github.com/darkobits/log/compare/v2.0.0-beta.16...v2.0.0-beta.17) (2024-12-01)


### Features

* Add new logger. ([5080695](https://github.com/darkobits/log/commit/50806954f42325b0cf86cbf71638ab92fee361f2))

## [2.0.0-beta.16](https://github.com/darkobits/log/compare/v2.0.0-beta.15...v2.0.0-beta.16) (2021-05-11)


### 📖 Documentation

* Update README.md. ([6d6df93](https://github.com/darkobits/log/commit/6d6df93843eb253f3c249116f7dd25bec6442634))


### 🏗 Chores

* **deps:** Update dependencies. ([7e106e9](https://github.com/darkobits/log/commit/7e106e9bbbb1197b34f4beaa14a44533b3489e27))
* Update .gitignore. ([dcaafa5](https://github.com/darkobits/log/commit/dcaafa516fe863f7956555b60299c25b5209e100))
* Update dependencies. ([28cc2f2](https://github.com/darkobits/log/commit/28cc2f21b2d77193e7a0393b2fb5bb1bdbec59f8))

## [2.0.0-beta.15](https://github.com/darkobits/log/compare/v2.0.0-beta.14...v2.0.0-beta.15) (2020-06-30)

## [2.0.0-beta.14](https://github.com/darkobits/log/compare/v2.0.0-beta.13...v2.0.0-beta.14) (2019-11-30)


### Bug Fixes

* Fix typing for streams. ([8e21708](https://github.com/darkobits/log/commit/8e21708a087c4c6f5a5b680019847c088d2d5841))

## [2.0.0-beta.13](https://github.com/darkobits/log/compare/v2.0.0-beta.12...v2.0.0-beta.13) (2019-11-30)


### Features

* Allow stream to be set to `false`. ([b1122bf](https://github.com/darkobits/log/commit/b1122bf87354f8b034f26932fa724ecbd3be64d9))

## [2.0.0-beta.12](https://github.com/darkobits/log/compare/v2.0.0-beta.11...v2.0.0-beta.12) (2019-11-19)

## [2.0.0-beta.11](https://github.com/darkobits/log/compare/v2.0.0-beta.10...v2.0.0-beta.11) (2019-10-29)

## [2.0.0-beta.10](https://github.com/darkobits/log/compare/v2.0.0-beta.9...v2.0.0-beta.10) (2019-08-29)


### Features

* Disable interactive sessions in CI environments. ([b1d1568](https://github.com/darkobits/log/commit/b1d1568))

## [2.0.0-beta.9](https://github.com/darkobits/log/compare/v2.0.0-beta.8...v2.0.0-beta.9) (2019-08-18)

## [2.0.0-beta.8](https://github.com/darkobits/log/compare/v2.0.0-beta.7...v2.0.0-beta.8) (2019-08-07)

## [2.0.0-beta.7](https://github.com/darkobits/log/compare/v2.0.0-beta.6...v2.0.0-beta.7) (2019-08-06)


### Features

* Add `createPipe`. ([d867833](https://github.com/darkobits/log/commit/d867833))

## [2.0.0-beta.6](https://github.com/darkobits/log/compare/v2.0.0-beta.5...v2.0.0-beta.6) (2019-08-06)


### Bug Fixes

* Fix logging during interactive sessions. ([c65ae1a](https://github.com/darkobits/log/commit/c65ae1a))

## [2.0.0-beta.5](https://github.com/darkobits/log/compare/v2.0.0-beta.4...v2.0.0-beta.5) (2019-08-06)

## [2.0.0-beta.4](https://github.com/darkobits/log/compare/v2.0.0-beta.3...v2.0.0-beta.4) (2019-08-06)



## [2.0.0-beta.3](https://github.com/darkobits/log/compare/v2.0.0-beta.2...v2.0.0-beta.3) (2019-07-15)


### Features

* Add spinners, timers, secrets masking. ([d31c512](https://github.com/darkobits/log/commit/d31c512))



## [2.0.0-beta.2](https://github.com/darkobits/log/compare/v2.0.0-beta.1...v2.0.0-beta.2) (2019-07-09)


### Bug Fixes

* Update log levels. ([1dd3594](https://github.com/darkobits/log/commit/1dd3594))



## [2.0.0-beta.1](https://github.com/darkobits/log/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2019-07-09)


### Bug Fixes

* Update log levels. ([85945c8](https://github.com/darkobits/log/commit/85945c8))



## [2.0.0-beta.0](https://github.com/darkobits/log/compare/v1.2.3...v2.0.0-beta.0) (2019-07-09)


### refactor

* Remove 'npmlog' dependency. ([f0dab2c](https://github.com/darkobits/log/commit/f0dab2c))


### BREAKING CHANGES

* Due to the significance of this re-write, this update will entail a major version bump.



### [1.2.3](https://github.com/darkobits/log/compare/v1.2.2...v1.2.3) (2019-06-07)



## [1.2.2](https://github.com/darkobits/log/compare/v1.2.1...v1.2.2) (2019-04-01)


### Bug Fixes

* Change message param to 'any' type. ([033671a](https://github.com/darkobits/log/commit/033671a))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/darkobits/log/compare/v1.1.2...v1.1.3) (2018-06-21)


### Bug Fixes

* LOG_LEVEL takes precedence over default from factory. ([736fc63](https://github.com/darkobits/log/commit/736fc63))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/darkobits/log/compare/v1.1.0...v1.1.2) (2018-06-21)


### Bug Fixes

* Update "main" field. ([41cc680](https://github.com/darkobits/log/commit/41cc680))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/darkobits/log/compare/v1.1.0...v1.1.1) (2018-06-21)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/darkobits/log/compare/v1.0.0...v1.1.0) (2018-03-17)


### Features

* log.error accepts Error instances. ([e2d4395](https://github.com/darkobits/log/commit/e2d4395))



<a name="1.0.0"></a>
# 1.0.0 (2017-11-10)


### Features

* Add log. ([23f26c8](https://github.com/darkobits/log/commit/23f26c8))
