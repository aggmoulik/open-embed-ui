(function () {
  var scripts = document.querySelectorAll('script[data-widget]');
  scripts.forEach(function (script) {
    var widgetId = script.getAttribute('data-widget');
    if (!widgetId) return;

    var container = document.getElementById('geu-' + widgetId);
    if (!container) return;

    var baseUrl = script.src.replace('/embed.js', '');
    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/embed/' + widgetId;
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.overflow = 'hidden';
    iframe.style.minHeight = '100px';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('loading', 'lazy');

    // Auto-resize based on content height
    window.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'geu-resize' && event.data.widgetId === widgetId) {
        iframe.style.height = event.data.height + 'px';
      }
    });

    container.appendChild(iframe);
  });
})();
