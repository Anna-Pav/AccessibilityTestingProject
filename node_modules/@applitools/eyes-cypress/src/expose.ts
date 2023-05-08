/*
 * The types here are compiled via `ttsc` and `api-extractor`, and are used to describe the inputs to
 * Eyes-Cypress custom commands. The reason they are not written in the `index.d.ts` file next to the
 * `declare global { namespace Cypress {...}}` statement is that `api-extractor` has a limitation (at
 * the time of writing this) that drops the `declare global` statement. So it's important to not pass
 * `index.d.ts` through `api-extractor`,but keep the types in this file go through it, to produce the
 * correct types for the SDK just like all other conventional SDK's.
 **/
/// <reference types="cypress" />
import type * as api from '@applitools/eyes-api'
import type * as core from '@applitools/core'
import {
  type EyesSelector,
  type TestResultsStatus,
  type DeviceName,
  type ScreenOrientationPlain,
  type AccessibilityRegionTypePlain,
} from '@applitools/eyes-api'

export type MaybeArray<T> = T | T[]
export type {EyesSelector, TestResultsStatus, DeviceName, ScreenOrientationPlain}
export type LegacyRegion = {left: number; top: number; width: number; height: number}
export type Selector = {selector: string; type?: 'css' | 'xpath'; nodeType?: 'element' | 'shadow-root'} | string
export type Element = HTMLElement | JQuery<HTMLElement>
export type ElementWithOptions = {element: Element; regionId?: string; padding?: any}
export type SelectorWithOptions = {region: Selector; regionId?: string; padding?: number | LegacyRegion}
type SpecType = core.SpecType<unknown, unknown, Element, Selector>
type CodedRegion = NonNullable<Element | ElementWithOptions | LegacyRegion | Selector | SelectorWithOptions>
export type AccessibilityValidation = NonNullable<CypressEyesConfig['defaultMatchSettings']>['accessibilitySettings']
export type FloatingRegion = MaybeArray<
  (ElementWithOptions | SelectorWithOptions | Selector | LegacyRegion) & {
    maxUpOffset?: number
    maxDownOffset?: number
    maxLeftOffset?: number
    maxRightOffset?: number
  }
>
export type accessibilityRegion = MaybeArray<
  | ((ElementWithOptions | Selector | LegacyRegion) & {
      accessibilityType?: AccessibilityRegionTypePlain
    })
  | {
      region: {selector: Selector; accessibilityType: AccessibilityRegionTypePlain}
      regionId?: string
      padding?: number | LegacyRegion
    }
>

export type CypressCheckSettings = api.CheckSettingsAutomationPlain<SpecType> & {
  tag?: string
  target?: 'window' | 'region'
  selector?: Selector
  element?: Element
  region?: LegacyRegion
  ignore?: MaybeArray<CodedRegion>
  layout?: MaybeArray<CodedRegion>
  content?: MaybeArray<CodedRegion>
  strict?: MaybeArray<CodedRegion>
  floating?: FloatingRegion
  accessibility?: accessibilityRegion
  scriptHooks?: CypressCheckSettings['hooks']
  ignoreCaret?: boolean
  ignoreDisplacements?: boolean
  browser?: MaybeArray<
    | NonNullable<CypressEyesConfig['browsersInfo']>[number]
    | {deviceName: DeviceName; screenOrientation?: ScreenOrientationPlain; name?: string}
  >
}
export type CypressEyesConfig = api.ConfigurationPlain<SpecType> & {
  browser?: MaybeArray<
    | NonNullable<CypressEyesConfig['browsersInfo']>[number]
    | {deviceName: DeviceName; screenOrientation?: ScreenOrientationPlain; name?: string}
  >

  batchId?: NonNullable<CypressEyesConfig['batch']>['id']
  batchName?: NonNullable<CypressEyesConfig['batch']>['name']
  batchSequence?: NonNullable<CypressEyesConfig['batch']>['sequenceName']
  notifyOnCompletion?: NonNullable<CypressEyesConfig['batch']>['notifyOnCompletion']
  batchSequenceName?: NonNullable<CypressEyesConfig['batch']>['sequenceName']

  envName?: CypressEyesConfig['environmentName']

  accessibilityValidation?: AccessibilityValidation
  matchLevel?: NonNullable<CypressEyesConfig['defaultMatchSettings']>['matchLevel']
  ignoreCaret?: NonNullable<boolean>
  ignoreDisplacements?: NonNullable<boolean>
  useDom?: NonNullable<boolean>
  enablePatterns?: NonNullable<boolean>
  scriptHooks?: {
    beforeCaptureScreenshot: string
  }
  saveNewTests?: boolean
  /** @internal */
  shouldUseBrowserHooks?: boolean
}

export type CypressTestResultsSummary = api.TestResultsSummary

export {type EyesPluginConfig} from './plugin'

import plugin from './plugin'
export default plugin
