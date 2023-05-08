function isPluginDefinedTypeScript(content) {
  return !!content.match(/from\s*['"]@applitools\/eyes-cypress['"]\s*/)
}

module.exports = isPluginDefinedTypeScript
