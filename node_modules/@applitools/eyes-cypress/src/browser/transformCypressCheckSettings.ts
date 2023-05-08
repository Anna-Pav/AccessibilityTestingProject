type MaybeArray<T> = T | T[]
import type {
  CypressCheckSettings,
  Element,
  Selector,
  LegacyRegion,
  ElementWithOptions,
  EyesSelector,
  SelectorWithOptions,
  FloatingRegion,
  accessibilityRegion,
} from '../expose'
import type {CheckSettings, SpecType} from '@applitools/core'
import * as utils from '@applitools/utils'
import {transformBrowsers} from './utils'
type CodedRegion = MaybeArray<Element | Selector | ElementWithOptions | SelectorWithOptions | LegacyRegion | EyesSelector>
type Ref = {'applitools-ref-id': string}
type RefRegionWIthOptions = {region: Ref} & {padding?: number | LegacyRegion; regionId?: string}

export function transformCypressCheckSettings(settings: CypressCheckSettings, refer: any): CheckSettings<SpecType, 'ufg'> {
  if (utils.types.isString(settings)) {
    return {name: settings}
  }
  const target = settings.target === 'region' ? transformTargetRegion(settings) : undefined
  return {
    renderers: transformBrowsers(settings.browser),
    hooks: settings.scriptHooks,
    disableBrowserFetching: settings.disableBrowserFetching,
    layoutBreakpoints: settings.layoutBreakpoints,
    ufgOptions: settings.visualGridOptions,
    name: settings.tag,
    ignoreRegions: transformRegionsWithOptions(settings.ignore),
    floatingRegions: convertFloatingRegion(settings.floating),
    strictRegions: transformRegionsWithOptions(settings.strict),
    contentRegions: transformRegionsWithOptions(settings.content),
    layoutRegions: transformRegionsWithOptions(settings.layout),
    accessibilityRegions: convertAccessabilityRegions(settings.accessibility),
    userCommandId: settings.variationGroupId,
    region: utils.types.has(target, 'region') ? target.region : undefined,
    ignoreCaret: settings.ignoreCaret,
    ignoreDisplacements: settings.ignoreDisplacements,
    fully: settings.fully,
    waitBeforeCapture: settings.waitBeforeCapture,
    lazyLoad: settings.lazyLoad,
    matchLevel: settings.matchLevel,
    useDom: settings.useDom,
    sendDom: settings.sendDom,
    enablePatterns: settings.enablePatterns,
    pageId: settings.pageId,
  }

  function transformTargetRegion(checkSettings: CypressCheckSettings): CheckSettings<SpecType, 'ufg'>['region'] {
    const shadowDomSettings: any = {}
    let regionSettings: any = {}
    if (!Array.isArray(checkSettings.selector)) {
      if (utils.types.has(checkSettings, 'element')) {
        if (isHTMLElement(checkSettings.element)) {
          regionSettings = {
            region: Object.assign(refer.ref(checkSettings.element), {type: 'element'}),
          }
        } else if (utils.types.has(checkSettings.element, [0])) {
          // JQuery element
          regionSettings = {
            region: Object.assign(refer.ref(checkSettings.element[0]), {type: 'element'}),
          }
        }
      } else if (
        utils.types.has(checkSettings, 'region') &&
        utils.types.has(checkSettings.region, 'top') &&
        utils.types.has(checkSettings.region, 'left') &&
        utils.types.has(checkSettings.region, 'width') &&
        utils.types.has(checkSettings.region, 'height')
      ) {
        regionSettings = {
          region: {
            y: checkSettings.region.top,
            x: checkSettings.region.left,
            width: checkSettings.region.width,
            height: checkSettings.region.height,
          },
        }
      } else if (!utils.types.has(checkSettings, 'selector')) {
        regionSettings = {
          region: checkSettings.region,
        }
      } else {
        regionSettings = {
          region: checkSettings.selector,
        }
      }
    } else {
      const selectors = checkSettings.selector
      for (let i = selectors.length - 1; i > -1; i--) {
        if (i === selectors.length - 1) {
          shadowDomSettings['shadow'] = selectors[i].selector
        } else {
          const prevSettings = Object.assign({}, shadowDomSettings)
          shadowDomSettings['selector'] = selectors[i].selector
          if (!prevSettings.hasOwnProperty('selector')) {
            shadowDomSettings['shadow'] = prevSettings.shadow
          } else {
            shadowDomSettings['shadow'] = prevSettings
          }
        }
      }
      regionSettings = {region: shadowDomSettings}
    }
    return regionSettings
  }

  function convertAccessabilityRegions(
    accessibilityRegions: accessibilityRegion,
  ): CheckSettings<SpecType, 'ufg'>['accessibilityRegions'] {
    if (!accessibilityRegions) return
    if (!Array.isArray(accessibilityRegions)) {
      accessibilityRegions = [accessibilityRegions]
    }
    const accessibility: any = []
    for (const region of accessibilityRegions) {
      const accessabilityRegion = {
        type: utils.types.has(region, 'accessibilityType') ? region.accessibilityType : undefined,
      }

      if (utils.types.has(region, 'selector')) {
        const currRegion = {...accessabilityRegion, region: region.selector}
        delete region.selector
        accessibility.push(currRegion)
      } else if (utils.types.has(region, 'element')) {
        const elements = refElements(region.element)
        delete region['element']
        for (const element of elements) {
          accessibility.push(Object.assign({}, region, accessabilityRegion, {region: element}))
        }
      } else if (utils.types.has(region, 'region')) {
        const currRegion = {...region, type: region.region.accessibilityType}
        delete currRegion.region.accessibilityType
        accessibility.push(currRegion)
      } else if (utils.types.has(region, 'top')) {
        accessibility.push({
          ...accessabilityRegion,
          region: {y: region.top, x: region.left, width: region.width, height: region.height},
        })
      } else {
        accessibility.push(region)
      }
    }
    return accessibility
  }

  function convertFloatingRegion(floatingRegions: FloatingRegion): CheckSettings<SpecType, 'ufg'>['floatingRegions'] {
    if (!floatingRegions) return
    if (!Array.isArray(floatingRegions)) {
      floatingRegions = [floatingRegions]
    }
    const floating = []

    for (const region of floatingRegions) {
      const floatingRegion = {
        offset: {
          bottom: region.maxDownOffset || 0,
          left: region.maxLeftOffset || 0,
          top: region.maxUpOffset || 0,
          right: region.maxRightOffset || 0,
        },
      }
      delete region.maxDownOffset
      delete region.maxLeftOffset
      delete region.maxUpOffset
      delete region.maxRightOffset
      if (utils.types.has(region, 'selector')) {
        const currRegion = {region: region.selector, ...region, ...floatingRegion}
        delete currRegion.selector
        floating.push(currRegion)
      } else if (utils.types.has(region, 'element')) {
        const elements = refElements(region.element)
        delete region.element
        for (const element of elements) {
          floating.push({...region, ...floatingRegion, region: element})
        }
      } else if (utils.types.has(region, 'region')) {
        const currRegion = {offset: floatingRegion.offset, ...region}
        floating.push(currRegion)
      } else if (utils.types.has(region, 'top')) {
        floating.push({
          ...floatingRegion,
          region: {
            y: region.top,
            x: region.left,
            width: region.width,
            height: region.height,
          },
        })
      } else {
        floating.push(region)
      }
    }
    return floating
  }

  function transformRegionsWithOptions(regions: CodedRegion): CheckSettings<SpecType, 'ufg'>['ignoreRegions'] {
    if (!regions) return
    if (!Array.isArray(regions)) regions = [regions]
    let resRegions: any = []
    for (const region of regions) {
      if (utils.types.has(region, 'element')) {
        if (utils.types.has(region, 'padding') || utils.types.has(region, 'regionId')) {
          const currRefElements = refElements(region.element)
          for (const refElement of currRefElements) {
            const curr: RefRegionWIthOptions = {region: refElement}
            if (region.padding) {
              curr.padding = region.padding
            }
            if (region.regionId) {
              curr.regionId = region.regionId
            }
            resRegions.push(curr)
          }
        } else {
          resRegions = [...resRegions, ...refElements(region.element)]
        }
      } else if (isHTMLElement(region) || utils.types.has(region, 'jquery')) {
        // @ts-ignore
        //for some reason TS doesn't recognize that region is an HTMLElement,
        //but if I paste the conditions from the method here, it does recornize it
        resRegions = [...resRegions, ...refElements(region)]
      } else {
        if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
          const currRegion = {region: region.selector, ...region}
          delete currRegion.selector
          resRegions.push(currRegion)
        } else {
          resRegions.push(region)
        }
      }
    }
    return resRegions
  }

  function refElements(regions: Element | Element[]): Ref[] {
    if (!regions) return
    if (!Array.isArray(regions)) regions = [regions]
    const elements = []
    for (const region of regions) {
      if (isHTMLElement(region)) {
        elements.push(Object.assign(refer.ref(region), {type: 'element'}))
      } else if (utils.types.has(region, 'jquery')) {
        region.each(function () {
          // there's a small chance that `this` is not an HTML element. So we just verify it.
          elements.push(isHTMLElement(this) ? Object.assign(refer.ref(this), {type: 'element'}) : this)
        })
      } else {
        elements.push(region)
      }
    }
    return elements
  }

  function isHTMLElement(element: CodedRegion): boolean {
    // Avoiding instanceof here since the element might come from an iframe, and `instanceof HTMLElement` would fail.
    // This check looks naive, but if anyone passes something like {nodeType: 1} as a region, then I'm fine with them crashing :)
    return utils.types.has(element, 'nodeType') && element.nodeType === Node.ELEMENT_NODE
  }
}
