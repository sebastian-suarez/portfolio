domain       = "sebastiansuarez.dev"
site_bucket  = "site-sebastiansuarez-dev-786638967614"
github_owner = "sebastian-suarez"
github_repo  = "portfolio"

# Account move (README, "Moving the site to a new distribution"): the new copy starts without the
# domain, the records or the request header rule. It enforces the origin lock and also accepts the
# secret the old copy's rule sends (that digest is public in the old function's code).
attach_domain              = true
manage_origin_lock_rule    = true
origin_lock_enforce        = true
origin_verify_extra_sha256 = ["4574bada26f6514041c2dc6a50dc0eed33e40dc3d1207f054e10ba74c4a23bf8"]
