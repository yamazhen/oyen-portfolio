// @ts-check
import { defineConfig, fontProviders } from 'astro/config'

import { unified } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import rehypeMermaid from 'rehype-mermaid'

const INK = '#14202b'
const ICE = '#eef3f6'
const LINE = '#cfdae2'
const MUTED = '#5b6b79'
const ACCENT = '#c2410c'
const PAPER = '#ffffff'
const JETBRAINS_MONO = '"JetBrains Mono", monospace'
const DIAGRAM_FONT = `var(--mono, ${JETBRAINS_MONO})`
const DIAGRAM_WRAP_WIDTH = 400
const DIAGRAM_FONT_SIZE = 13

const mermaid = {
  strategy: 'inline-svg',
  css: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=block',
  mermaidConfig: {
    theme: 'base',
    fontFamily: JETBRAINS_MONO,
    htmlLabels: false,
    flowchart: { htmlLabels: false, wrappingWidth: DIAGRAM_WRAP_WIDTH },
    sequence: {
      actorFontFamily: JETBRAINS_MONO,
      messageFontFamily: JETBRAINS_MONO,
      noteFontFamily: JETBRAINS_MONO,
      actorFontSize: DIAGRAM_FONT_SIZE,
      messageFontSize: DIAGRAM_FONT_SIZE,
      noteFontSize: DIAGRAM_FONT_SIZE,
    },
    themeVariables: {
      fontFamily: DIAGRAM_FONT,
      fontSize: `${DIAGRAM_FONT_SIZE}px`,
      background: PAPER,
      primaryColor: ICE,
      primaryTextColor: INK,
      primaryBorderColor: INK,
      secondaryColor: PAPER,
      tertiaryColor: PAPER,
      lineColor: INK,
      textColor: INK,
      clusterBkg: PAPER,
      clusterBorder: LINE,
      edgeLabelBackground: PAPER,
      actorBkg: ICE,
      actorBorder: INK,
      actorTextColor: INK,
      actorLineColor: LINE,
      signalColor: INK,
      signalTextColor: INK,
      labelBoxBkgColor: PAPER,
      labelBoxBorderColor: LINE,
      labelTextColor: MUTED,
      loopTextColor: MUTED,
      noteBkgColor: PAPER,
      noteBorderColor: ACCENT,
      noteTextColor: INK,
      activationBkgColor: ICE,
      activationBorderColor: INK,
      sequenceNumberColor: PAPER,
    },
  },
}

// https://astro.build/config
export default defineConfig({
  site: 'https://yamazhen.dev',
  integrations: [sitemap()],
  vite: {
    optimizeDeps: { include: ['three'] },
  },
  devToolbar: { enabled: false },
  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] },
    processor: unified({ rehypePlugins: [[rehypeMermaid, mermaid]] }),
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bricolage Grotesque',
      cssVariable: '--font-bricolage',
      weights: ['400 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
      options: { experimental: { variableAxis: { opsz: [['12', '96']] } } },
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
})
