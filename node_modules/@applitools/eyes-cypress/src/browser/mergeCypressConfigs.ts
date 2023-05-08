import type {CypressEyesConfig} from '../expose'

export function mergeCypressConfigs({
  globalConfig,
  openConfig,
}: {
  globalConfig: CypressEyesConfig
  openConfig: CypressEyesConfig
}): CypressEyesConfig {
  return {
    ...globalConfig,
    ...openConfig,
    batch: {...globalConfig.batch, ...openConfig.batch},
  }
}
