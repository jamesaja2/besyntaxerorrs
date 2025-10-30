# Edge Cache and Compression Snippets

Use these templates when configuring the edge layer (Nginx origin or Cloudflare) so the optimized Vite bundles stay compressed and cacheable.

## Nginx (Origin Server)

```nginx
# Brotli and gzip compression (Brotli preferred)
brotli on;
brotli_comp_level 5;
brotli_static always;
brotli_types text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml;

gzip on;
gzip_comp_level 6;
gzip_min_length 256;
gzip_types text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml;

types_hash_max_size 4096;

# Cache immutable build assets for 1 year
location ~* \.(?:js|mjs|css|woff2|svg|webp|avif)$ {
    expires 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header Vary "Accept-Encoding";
    try_files $uri /index.html;
}

# Cache media assets for 30 days
location ~* \.(?:png|jpe?g|gif|ico)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    add_header Vary "Accept-Encoding";
    try_files $uri /index.html;
}

# Always serve index.html for SPA routes without caching
location / {
    add_header Cache-Control "no-cache";
    try_files $uri $uri/ /index.html;
}
```

## Cloudflare (Rules and Compression)

1. **Brotli:** Enable *Speed → Optimization → Brotli* (default: on).
2. **Cache Rules:**
   - Match: `*.{js,mjs,css,woff2,svg,webp,avif}` → Edge TTL `1 year`, Cache Key includes scheme + host + path.
   - Match: `*.{png,jpg,jpeg,gif,ico}` → Edge TTL `30 days`.
   - Default HTML rule → Bypass cache.
3. **Transform Rule (optional):** Strip query strings for static asset requests to improve cache hit ratio.
4. **Tiered Cache + Smart Tiered Cache:** Enable to reduce origin hits when multiple POPs request the same asset.

These defaults align with the new `build:prod` output (hashed filenames) so cached assets can remain immutable between deployments.
