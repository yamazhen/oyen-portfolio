import type { Lang } from '../../data/ui'

export const LINES = {
  en: {
    greeting: "hi. i'm oyen.",
    quips: ['noot!', 'my name is oyen', 'hehe', 'hmm?'],
  },
  ko: {
    greeting: '안녕. 난 오옌이야.',
    quips: ['누트!', '내 이름은 오옌', '히히', '음?'],
  },
} satisfies Record<Lang, { greeting: string; quips: string[] }>
