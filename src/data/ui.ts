export const languages = { en: 'English', ko: '한국어' }

export type Lang = keyof typeof languages

export const langs = Object.keys(languages) as Lang[]

export const localize = <T extends { ko?: object }>(data: T, lang: Lang) =>
  lang === 'ko' ? { ...data, ...data.ko } : data

export const ui = {
  en: {
    description:
      "Bowen Chong's portfolio: full-stack developer working on dataspaces and verifiable credentials.",
    experience: 'experience',
    work: 'selected work',
    awards: 'education and awards',
    skills: 'skills',
    about: 'about',
    aboutWork:
      "I'm from Malaysia and live in South Korea, where I build dataspace software at Circular Solution: how organisations exchange product data and prove who they are.",
    aboutOyen:
      'Outside work I write Neovim plugins. One of them is named after Oyen, my penguin, who is standing on the ice on this page.',
    footer: 'oyen is a real penguin. the plush kind.',
    previous: '← previous',
    next: 'next →',
  },
  ko: {
    description:
      'Bowen Chong의 포트폴리오: 데이터 스페이스와 검증 가능한 자격증명(Verifiable Credentials)을 다루는 풀스택 개발자.',
    experience: '경력',
    work: '주요 프로젝트',
    awards: '학력 및 수상',
    skills: '기술',
    about: '소개',
    aboutWork:
      '말레이시아에서 왔고 지금은 한국에 살고 있습니다. Circular Solution에서 기업들이 제품 데이터를 주고받고 자신이 누구인지 증명하는 방식, 즉 데이터 스페이스 소프트웨어를 만들고 있습니다.',
    aboutOyen:
      '일 밖에서는 Neovim 플러그인을 만듭니다. 그중 하나는 이 페이지의 얼음 위에 서 있는 제 펭귄, 오옌의 이름을 따왔습니다.',
    footer: '오옌은 진짜 펭귄입니다. 인형이지만요.',
    previous: '← 이전',
    next: '다음 →',
  },
}
