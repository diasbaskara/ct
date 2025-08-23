module.exports = function(source) {
  const options = this.getOptions() || {};
  const scriptName = options.scriptName || 'userscript';
  const cssString = JSON.stringify(source);
  return `
    const style = document.createElement('style');
    style.textContent = ${cssString};
    const selector = 'style[data-${scriptName}]';
    if (!document.head.querySelector(selector)) {
      style.setAttribute('data-${scriptName}', 'true');
      document.head.appendChild(style);
    }
    export default ${cssString};
  `;
};