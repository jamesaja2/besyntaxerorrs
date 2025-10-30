import { defineConfig, type HtmlTagDescriptor, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import viteImagemin from 'vite-plugin-imagemin'

const srcPath = decodeURI(new URL('./src', import.meta.url).pathname)

const preloadEntrypoints = (): PluginOption => ({
  name: 'preload-critical-css-fonts',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml(html, ctx) {
    if (!ctx?.bundle) {
      return html
    }

    const tags: HtmlTagDescriptor[] = []
    const seen = new Set<string>()

    for (const output of Object.values(ctx.bundle)) {
      if (output.type === 'chunk') {
        const metadata = (output as any).viteMetadata
        const importedCss: string[] = metadata?.importedCss ?? []
        importedCss.forEach((cssFile) => {
          const href = cssFile.startsWith('/') ? cssFile : `/${cssFile}`
          if (!seen.has(href)) {
            seen.add(href)
            tags.push({
              tag: 'link',
              injectTo: 'head-prepend',
              attrs: {
                rel: 'preload',
                as: 'style',
                href,
              },
            })
          }
        })

        const importedAssets = Array.isArray(metadata?.importedAssets)
          ? metadata?.importedAssets
          : Array.from(metadata?.importedAssets ?? [])
        const fontAssets = importedAssets.filter((asset: unknown): asset is string =>
          typeof asset === 'string' && asset.endsWith('.woff2'),
        )

        fontAssets.forEach((asset: string) => {
            const href = asset.startsWith('/') ? asset : `/${asset}`
            if (!seen.has(href)) {
              seen.add(href)
              tags.push({
                tag: 'link',
                injectTo: 'head-prepend',
                attrs: {
                  rel: 'preload',
                  as: 'font',
                  type: 'font/woff2',
                  crossorigin: '',
                  href,
                },
              })
            }
          })
      } else if (output.type === 'asset' && output.fileName.endsWith('.css')) {
        const href = `/${output.fileName}`
        if (!seen.has(href)) {
          seen.add(href)
          tags.push({
            tag: 'link',
            injectTo: 'head-prepend',
            attrs: {
              rel: 'preload',
              as: 'style',
              href,
            },
          })
        }
      } else if (output.type === 'asset' && output.fileName.endsWith('.woff2')) {
        const href = `/${output.fileName}`
        if (!seen.has(href)) {
          seen.add(href)
          tags.push({
            tag: 'link',
            injectTo: 'head-prepend',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              crossorigin: '',
              href,
            },
          })
        }
      }
    }

    if (tags.length === 0) {
      return html
    }

    return {
      html,
      tags,
    }
  },
})

export default defineConfig({
  plugins: [
    react(),
    imagetools(),
    preloadEntrypoints(),
    viteImagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 5 },
      mozjpeg: { quality: 75 },
      pngquant: { quality: [0.65, 0.8], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'cleanupIDs', active: true },
        ],
      },
      webp: { quality: 82 },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  build: {
    cssCodeSplit: true,
    reportCompressedSize: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
