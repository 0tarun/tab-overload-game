import type { TabType } from './types'

export const ROUND_SECONDS = 120
export const LAG_THRESHOLD = 70
export const WORK_PARAGRAPH =
  'Per my last email, circling back on the synergy workshop. Going forward we will leverage our core competencies to move the needle, but I need everyone to please advise by EOD. Let us take this offline, touch base, and remember: there is no I in team, but there is a U in unemployed. Best regards, Management.'

export const TAB_TITLES: Record<TabType, string[]> = {
  'autoplay-video': ['TOP 10 EXCEL FAILS (GONE WRONG)', 'LO-FI RAM DESTROYER', 'LIVE: meeting that could be an email', 'You will not believe this keyboard trick'],
  'cookie-consent': ['We value your privacy (tm)', 'GDPR SUPER-MEGA-POLICY v48.2', 'Cookies? In MY browser?!', 'Consent-O-Tron 9000'],
  'infinite-captcha': ['Are you human? Prove it. Again.', 'CAPTCHA — Definitely Not A Robot Check', 'One quick verification', 'Human Verification Required'],
}

export const BSOD_ERROR_CODES = [
  'KERNEL_PANIC_AT_THE_DISCO',
  'RAM_TOO_RAM (0x0000RAM)',
  'TOO_MANY_TABS_EXCEPTION',
  'MEMORY_MANAGEMENT_DID_NOT_MANAGE',
  'STACK_OVERFLOW_AT_TAB_47',
]

export const WIN_QUOTES = [
  'Task complete. Somewhere, an autoplay video is still screaming into the void.',
  'You survived the tab-pocalypse. HR has been notified of your suspicious competence.',
  'Quarterly report delivered. Your manager has already scheduled a meeting about it.',
]

export const COOKIE_FAKE_BUTTONS = [
  'Accept All',
  'Accept All Cookies',
  'Sure, Whatever',
  'I Love Cookies',
  'OK (Accept All)',
]

export const CAPTCHA_POOLS = [
  { prompt: 'Select all Pigeons', correct: '🕊️', decoys: ['🐈', '🚗', '🌳'] },
  { prompt: 'Select all Bicycles', correct: '🚲', decoys: ['🚗', '🌳', '🚒'] },
  { prompt: 'Select all Fire Hydrants', correct: '🚒', decoys: ['🐈', '🕊️', '🌳'] },
]
