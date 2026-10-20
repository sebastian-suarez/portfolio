// CloudFront Function (cloudfront-js-2.0), viewer-request.
// 1) www.<domain> -> https://<domain> (301), keeping path + query string.
// 2) Astro's default build.format = "directory" writes /about/index.html, but S3 (REST endpoint via OAC)
//    has no "index document" concept, so /about and /about/ are rewritten to /about/index.html here.
//    Paths whose last segment contains a dot (/robots.txt, /_astro/x.abc123.css) pass through untouched.
function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var host = headers.host ? headers.host.value : '';

  if (host.startsWith('www.')) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://' + host.slice(4) + request.uri + queryString(request.querystring) },
        'cache-control': { value: 'public, max-age=3600' }
      }
    };
  }

  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else {
    var last = uri.slice(uri.lastIndexOf('/') + 1);
    if (last.indexOf('.') === -1) {
      request.uri = uri + '/index.html';
    }
  }
  return request;
}

// Rebuilds the query string from the event object (values are passed through as CloudFront gave them,
// which is how AWS's own examples do it).
function queryString(qs) {
  var parts = [];
  for (var key in qs) {
    var entry = qs[key];
    if (entry.multiValue) {
      for (var i = 0; i < entry.multiValue.length; i++) {
        parts.push(key + '=' + entry.multiValue[i].value);
      }
    } else {
      parts.push(key + '=' + entry.value);
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}
