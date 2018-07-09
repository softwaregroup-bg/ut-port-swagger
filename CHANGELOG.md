<a name="1.2.2"></a>
## [1.2.2](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v1.2.1...v1.2.2) (2018-07-09)


### Bug Fixes

* pass request headers in ([fbd02fb](https://github.com/softwaregroup-bg/ut-port-swagger/commit/fbd02fb))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v1.2.0...v1.2.1) (2018-07-03)


### Bug Fixes

* Automatically set successful status code based on the swagger document definition. Improve error handling. ([68ce222](https://github.com/softwaregroup-bg/ut-port-swagger/commit/68ce222))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v1.1.3...v1.2.0) (2018-06-28)


### Bug Fixes

* add custom keyword ([54ad23a](https://github.com/softwaregroup-bg/ut-port-swagger/commit/54ad23a))
* add custom keyword x-occurances ([f6b4c62](https://github.com/softwaregroup-bg/ut-port-swagger/commit/f6b4c62))
* add file upload support in custom validator ([84f7506](https://github.com/softwaregroup-bg/ut-port-swagger/commit/84f7506))
* add metaschema for x-required and x-file. Improve x-occurrences. Remove x-required and x-file as they are used internally only. ([1449487](https://github.com/softwaregroup-bg/ut-port-swagger/commit/1449487))
* add minProperties equal to maxProperties so that the can be exactly 4 ([0d9531c](https://github.com/softwaregroup-bg/ut-port-swagger/commit/0d9531c))
* Ajv wrapping class ([422b939](https://github.com/softwaregroup-bg/ut-port-swagger/commit/422b939))
* custom required and file validations ([c5f7968](https://github.com/softwaregroup-bg/ut-port-swagger/commit/c5f7968))
* fix x-occurrences matching algorithm ([30a3a6e](https://github.com/softwaregroup-bg/ut-port-swagger/commit/30a3a6e))
* fix x-occurrences validation bugs ([f881e09](https://github.com/softwaregroup-bg/ut-port-swagger/commit/f881e09))
* improve x-occurrences validations. add custom messages ([db288ce](https://github.com/softwaregroup-bg/ut-port-swagger/commit/db288ce))
* put validation handler into a separate function. create empty validator ([ae5a6cc](https://github.com/softwaregroup-bg/ut-port-swagger/commit/ae5a6cc))
* refactoring ([3cdb52c](https://github.com/softwaregroup-bg/ut-port-swagger/commit/3cdb52c))
* refactoring plus wrapper middleware ([a44bdc7](https://github.com/softwaregroup-bg/ut-port-swagger/commit/a44bdc7))
* use  to support relationships between fields ([440d7d2](https://github.com/softwaregroup-bg/ut-port-swagger/commit/440d7d2))
* x-occurances min and max values. Add documentation. Rename  to x-required and  to x-file ([ccb48cc](https://github.com/softwaregroup-bg/ut-port-swagger/commit/ccb48cc))


### Features

* custom validator ([2b3f9c9](https://github.com/softwaregroup-bg/ut-port-swagger/commit/2b3f9c9))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v1.1.2...v1.1.3) (2018-06-27)


### Bug Fixes

* remove koa-cors in favour [@koa](https://github.com/koa)/cors ([38aaf7a](https://github.com/softwaregroup-bg/ut-port-swagger/commit/38aaf7a))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v1.1.1...v1.1.2) (2018-06-09)


### Bug Fixes

* remove lodash.merge dependency ([285b0d2](https://github.com/softwaregroup-bg/ut-port-swagger/commit/285b0d2))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v1.1.0...v1.1.1) (2018-06-08)


### Bug Fixes

* make swaggerDocument private ([478916d](https://github.com/softwaregroup-bg/ut-port-swagger/commit/478916d))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v1.0.0...v1.1.0) (2018-06-08)


### Features

* add possibility to pass swaggerDocument ([402c831](https://github.com/softwaregroup-bg/ut-port-swagger/commit/402c831))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v0.5.2...v1.0.0) (2018-06-06)


### Features

* reorganize config an add possibility to pass options per middleware ([4f847d6](https://github.com/softwaregroup-bg/ut-port-swagger/commit/4f847d6))


### BREAKING CHANGES

* configuration options are different
* this version is not compatible with previous versions



<a name="0.5.2"></a>
## [0.5.2](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v0.5.1...v0.5.2) (2018-06-05)


### Bug Fixes

* optimize code ([6548f3f](https://github.com/softwaregroup-bg/ut-port-swagger/commit/6548f3f))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v0.5.0...v0.5.1) (2018-06-05)


### Bug Fixes

* abstract koa router and request handlers into a common middleware called router ([d15361d](https://github.com/softwaregroup-bg/ut-port-swagger/commit/d15361d))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v0.4.0...v0.5.0) (2018-06-05)


### Features

* split validators and add file upload support for swagger 2 ([34bf50e](https://github.com/softwaregroup-bg/ut-port-swagger/commit/34bf50e))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v0.3.0...v0.4.0) (2018-06-04)


### Features

* pass formData files to handlers ([68af4bd](https://github.com/softwaregroup-bg/ut-port-swagger/commit/68af4bd))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v0.2.1...v0.3.0) (2018-06-01)


### Bug Fixes

* improve code structure ([a7ee4f1](https://github.com/softwaregroup-bg/ut-port-swagger/commit/a7ee4f1))
* improve errors ([2b344eb](https://github.com/softwaregroup-bg/ut-port-swagger/commit/2b344eb))
* refactor ([382c287](https://github.com/softwaregroup-bg/ut-port-swagger/commit/382c287))
* remove unused file ([2ea523c](https://github.com/softwaregroup-bg/ut-port-swagger/commit/2ea523c))


### Features

* use swagger2 instead of swagger2-koa ([a88442f](https://github.com/softwaregroup-bg/ut-port-swagger/commit/a88442f))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/softwaregroup-bg/ut-port-swagger/compare/v0.2.0...v0.2.1) (2018-05-31)


### Bug Fixes

* use uuid module and fix port start log message ([b2b30f7](https://github.com/softwaregroup-bg/ut-port-swagger/commit/b2b30f7))



<a name="0.2.0"></a>
# 0.2.0 (2018-05-30)


### Bug Fixes

* add comments in code ([7dfb64a](https://github.com/softwaregroup-bg/ut-port-swagger/commit/7dfb64a))
* add docs ([68adc66](https://github.com/softwaregroup-bg/ut-port-swagger/commit/68adc66))
* add LICENSE and update repository url ([6746e97](https://github.com/softwaregroup-bg/ut-port-swagger/commit/6746e97))
* comply with native node.js http server ([7aa4372](https://github.com/softwaregroup-bg/ut-port-swagger/commit/7aa4372))
* initial version ([cf72039](https://github.com/softwaregroup-bg/ut-port-swagger/commit/cf72039))
* typo ([c77bc9b](https://github.com/softwaregroup-bg/ut-port-swagger/commit/c77bc9b))
* use strict ([9ca6304](https://github.com/softwaregroup-bg/ut-port-swagger/commit/9ca6304))


### Features

* enable metrics and optimize code ([f584d0c](https://github.com/softwaregroup-bg/ut-port-swagger/commit/f584d0c))



