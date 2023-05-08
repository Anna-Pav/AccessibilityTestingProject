import * as utils from '@applitools/utils'

import type {CypressEyesConfig, MaybeArray, DeviceName, ScreenOrientationPlain} from '../expose'
import type {SpecType, Config} from '@applitools/core'
import type {Renderer} from '@applitools/core'

type CypressBrowser = MaybeArray<Renderer | {deviceName: DeviceName; screenOrientation?: ScreenOrientationPlain; name?: string}>

export function transformBrowsers(browsers: CypressBrowser): Renderer[] {
  if (!browsers) return
  if (!Array.isArray(browsers)) browsers = [browsers]

  return browsers.map(browser => {
    if (utils.types.has(browser, 'width') && utils.types.has(browser, 'height') && !utils.types.has(browser, 'name')) {
      browser.name = 'chrome'
      return browser
    } else if (utils.types.has(browser, 'deviceName')) {
      return {chromeEmulationInfo: browser}
    } else {
      return browser
    }
  })
}

export function transformAccessibilityValidation(
  accessibilityValidation: NonNullable<CypressEyesConfig['defaultMatchSettings']>['accessibilitySettings'],
): Config<SpecType, 'ufg'>['check']['accessibilitySettings'] {
  if (!accessibilityValidation) return
  return {
    level: accessibilityValidation.level,
    version: accessibilityValidation.guidelinesVersion,
  }
}
