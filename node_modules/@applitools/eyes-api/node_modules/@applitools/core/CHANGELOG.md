# Change Log

## Unreleased

## 2.3.14 - 2023/3/7

### Features
### Bug fixes
- Upgrade tunnel version

## 2.3.13 - 2023/3/7

### Features
### Bug fixes
- Fixed selector transformation for scroll root elements for ufg

## 2.3.12 - 2023/3/7

### Features
- Update broker url using last response instead of using driver
### Bug fixes
- Replaced broker url cache with nml element cache

## 2.3.11 - 2023/3/6

### Features
### Bug fixes
- setting the universal cli for javascript right

## 2.3.10 - 2023/3/3

### Features
- Added `Resize` stitch mode value
### Bug fixes
- Fixed issue when `.visualgrid` was not added to agent id
- Fixed issue with aborting ufg tests

## 2.3.9 - 2023/3/2

### Features
### Bug fixes
- Update `@applitools/execution-grid-tunnel` dependency

## 2.3.8 - 2023/3/2

### Features
### Bug fixes
- upgrade dom-snapshot with a fix to CSP

## 2.3.7 - 2023/2/23

### Features
- Added caching for broker url to avoid looking for the nml element multiple times
- Passing density metric for PPI support in the sdk
### Bug fixes
- Fixed issue with universal protocol when manager ref was deleted once `EyesManager.getResults` was called
- Fixed vulnerabilities of EC client

## 2.3.6 - 2023/2/17

### Features
### Bug fixes
- Update some type declarations

## 2.3.5 - 2023/2/17

### Features
- Improve logging in core server
### Bug fixes
- Fixed issue when core server was hanging if any command was called immediately after `Core.makeCore` command
- Fixed issue when `StaticDriver` and `StaticElement` were not recognized as a valid driver or element objects

## 2.3.4 - 2023/2/16

### Features
### Bug fixes
- Fixed ws types

## 2.3.3 - 2023/2/16

### Features
### Bug fixes
- Fixed debug mode
- Fixed logs

## 2.3.2 - 2023/2/16

### Features
- Added arm64 binary
### Bug fixes

## 2.3.1 - 2023/2/15

### Features
- Avoid helper initialization on native devices before it required
### Bug fixes

## 2.3.0 - 2023/2/15

### Features
- Integrate universal protocol to run core via transport
### Bug fixes

## 2.2.0 - 2023/2/15

### Features
- Integrate universal protocol to run core via transport
### Bug fixes

## 2.0.2 - 2022/12/27

### Features
- Created
### Bug fixes
