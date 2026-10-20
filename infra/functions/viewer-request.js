// CloudFront Function (cloudfront-js-2.0), viewer-request.
// OpenTofu renders this file with templatefile() (../cloudfront.tf), so a literal dollar-brace or
// percent-brace needs its first character doubled.
// 0) Origin lock: Cloudflare adds a secret header to the HTTPS requests it sends here
//    (../origin-lock.tf). This code holds only SHA-256 digests of the accepted secrets. A request
//    without a match gets a 403, or a log line in report mode, so the *.cloudfront.net name and
//    CloudFront IPs can't be used to skip Cloudflare.
// 1) www.<domain> -> https://<domain> (301), keeping path + query string.
// 2) Astro's default build.format = "directory" writes /about/index.html, but S3 (REST endpoint via OAC)
//    has no "index document" concept, so /about and /about/ are rewritten to /about/index.html here.
//    Paths whose last segment contains a dot (/robots.txt, /_astro/x.abc123.css) pass through untouched.
var crypto = require('crypto');

var VERIFY_HEADER = '${verify_header}';
var VERIFY_SHA256 = ${jsonencode(verify_sha256)};
var ENFORCE = ${enforce};

function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var host = headers.host ? headers.host.value : '';

  var proof = headers[VERIFY_HEADER];
  delete headers[VERIFY_HEADER];
  if (!fromCloudflare(proof)) {
    if (ENFORCE) {
      return {
        statusCode: 403,
        statusDescription: 'Forbidden',
        headers: {
          'content-type': { value: 'text/plain; charset=utf-8' },
          'cache-control': { value: 'no-store' }
        },
        body: 'Forbidden\n'
      };
    }
    // Report mode: serve as usual and log why. Never log the header value.
    console.log('origin-lock: ' + (proof ? 'mismatch' : 'missing') + ' host=' + host.slice(0, 100) +
      ' cf-ray=' + (headers['cf-ray'] ? 'yes' : 'no'));
  }

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

// True when the header holds one of the accepted secrets. Comparing digests also means a mismatch
// tells nothing about the secret's characters.
function fromCloudflare(proof) {
  if (!proof || !proof.value) {
    return false;
  }
  var digest = crypto.createHash('sha256').update(proof.value).digest('hex');
  return VERIFY_SHA256.indexOf(digest) !== -1;
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
