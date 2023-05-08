const CYPRESS_SUPPORTED_VERSION = '6.2.0'
const CYPRESS_NO_FLAG_VERSION = '6.7.0'

export default function isGlobalHooksSupported(config: any) {
  const {version, experimentalRunEvents} = config

  return (
    parseFloat(version) >= parseFloat(CYPRESS_NO_FLAG_VERSION) ||
    (parseFloat(version) >= parseFloat(CYPRESS_SUPPORTED_VERSION) && !!experimentalRunEvents)
  )
}
