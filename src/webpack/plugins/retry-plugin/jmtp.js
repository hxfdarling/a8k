const Template = require('webpack/lib/Template');

class MainTemplatePlugin {
  constructor(sriPlugin, compilation) {
    this.sriPlugin = sriPlugin;
    this.compilation = compilation;
  }

  jsonpScriptPlugin(mainTemplate, source) {
    return (Template.asString || mainTemplate.asString)([source, 'script.onerror = ()=>{} ']);
  }

  apply(mainTemplate) {
    const jsonpScriptPlugin = this.jsonpScriptPlugin.bind(this, mainTemplate);
    const addSriHashes = this.addSriHashes.bind(this, mainTemplate);

    if (!mainTemplate.hooks) {
      mainTemplate.plugin('jsonp-script', jsonpScriptPlugin);
      mainTemplate.plugin('local-vars', addSriHashes);
    } else if (mainTemplate.hooks.jsonpScript && mainTemplate.hooks.localVars) {
      mainTemplate.hooks.jsonpScript.tap('SriPlugin', jsonpScriptPlugin);
      mainTemplate.hooks.localVars.tap('SriPlugin', addSriHashes);
    } else {
      this.sriPlugin.warnOnce(this.compilation, 'This plugin is not useful for non-web targets.');
    }
  }
}
module.exports = MainTemplatePlugin;
