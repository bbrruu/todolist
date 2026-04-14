import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '我的事項',
    short_name: '事項',
    description: '個人待辦事項清單',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDF6EE',
    theme_color: '#D97040',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
