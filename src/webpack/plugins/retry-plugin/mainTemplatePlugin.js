const Template = require('webpack/lib/Template');

class MainTemplatePlugin {
  constructor(retryPlugin, compilation) {
    this.retryPlugin = retryPlugin;
    this.compilation = compilation;
  }

  jsonpScriptPlugin(mainTemplate, source) {
    return (Template.asString || mainTemplate.asString)([
      source,
      `
// retry-plugin inject retry load js resource
script.setAttribute('isAsync','')
var retryJS = function(event){
  clearTimeout(timeout);
  ${this.retryPlugin.genRetryCode(`
          onScriptComplete(event);
  `)}
}
script.onload = function(event){
  onScriptComplete(event);
  retryJS.call(this,event);
}
script.onerror = retryJS;
`,
    ]);
  }

  cssPlugin(mainTemplate, source) {
    return (Template.asString || mainTemplate.asString)([source, 'link.onerror = ()=>{} ']);
  }

  apply(mainTemplate) {
    const jsonpScriptPlugin = this.jsonpScriptPlugin.bind(this, mainTemplate);
    // const cssPlugin = this.cssPlugin.bind(this, mainTemplate);
    const { hooks } = mainTemplate;
    console.log(Object.keys(hooks));
    if (hooks.jsonpScript) {
      hooks.jsonpScript.tap('RetryPlugin', jsonpScriptPlugin);
      // hooks.localVars.tap('RetryPlugin', cssPlugin);
    } else {
      throw Error('This plugin is not useful for non-web targets.');
    }
  }
}
module.exports = MainTemplatePlugin;
