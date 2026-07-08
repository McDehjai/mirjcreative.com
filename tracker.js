(function () {
  var WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxSeGhFC0dwByV-LYFqQLjCqPeCvDiC8shKbjC0KYcuHMjc6_-vDGjFfqz-VGRe23o1/exec';
  var startTime = Date.now();
  var sent = false;
  var geo = {};

  function getDevice() {
    var ua = navigator.userAgent;
    if (/iPad|Tablet/i.test(ua)) return 'Tablet';
    if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Edg/') > -1) return 'Edge';
    if (ua.indexOf('OPR/') > -1 || ua.indexOf('Opera') > -1) return 'Opera';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    return 'Other';
  }

  function sendData() {
    if (sent) return;
    sent = true;
    var duration = Math.round((Date.now() - startTime) / 1000);
    var payload = {
      page: window.location.pathname + window.location.search,
      referrer: document.referrer || 'direct',
      city: geo.city || '',
      region: geo.region || '',
      country: geo.country_name || '',
      device: getDevice(),
      browser: getBrowser(),
      duration: duration
    };
    try {
      var blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(WEBHOOK_URL, blob);
      } else {
        fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify(payload), keepalive: true });
      }
    } catch (err) {
      /* fail silently, never break the page for a tracking error */
    }
  }

  fetch('https://ipapi.co/json/')
    .then(function (r) { return r.json(); })
    .then(function (data) { geo = data || {}; })
    .catch(function () { geo = {}; });

  window.addEventListener('pagehide', sendData);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendData();
  });
})();
