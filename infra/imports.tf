# Account move, last step: the request header rule changes hands from the old state (removed there
# with tofu state rm). Delete this file once the rule is in this state.
import {
  to = cloudflare_ruleset.request_headers[0]
  id = "zones/ed1796dc7261c72ff630e77a212d03ff/b1bfc6ca009a44e6a550f66798eafdb6"
}
