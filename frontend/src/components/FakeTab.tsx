import { useState } from 'react'
import { useGame } from '../game/useGame'
import { CAPTCHA_POOLS, COOKIE_FAKE_BUTTONS } from '../game/content'
import type { TabInstance } from '../game/types'

interface FakeTabProps {
  tab: TabInstance
  onWrongCookie: () => void
}

export function FakeTab({ tab, onWrongCookie }: FakeTabProps) {
  const { dispatch } = useGame()
  const [rejectPosition, setRejectPosition] = useState({ top: 80, left: 58 })
  const [captcha] = useState(() => {
    const pool = CAPTCHA_POOLS[Math.floor(Math.random() * CAPTCHA_POOLS.length)]
    const cells = [
      ...Array.from({ length: 3 }, () => ({ icon: pool.correct, correct: true })),
      ...Array.from({ length: 6 }, (_, index) => ({ icon: pool.decoys[index % pool.decoys.length], correct: false })),
    ].sort(() => Math.random() - 0.5)
    return { prompt: pool.prompt, cells }
  })
  const [selected, setSelected] = useState<number[]>([])
  const [captchaError, setCaptchaError] = useState(false)

  const act = (type: 'CLOSE_TAB' | 'MINIMIZE_TAB' | 'RESTORE_TAB' | 'TOGGLE_MAXIMIZE' | 'FOCUS_TAB' | 'MUTE_TAB') => dispatch({ type, id: tab.id })
  const selectCaptcha = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((item) => item !== index))
      return
    }
    if (!captcha.cells[index].correct) {
      setSelected([])
      setCaptchaError(true)
      dispatch({ type: 'RAM_PENALTY', amount: 1 })
      window.setTimeout(() => setCaptchaError(false), 700)
      return
    }
    const next = [...selected, index]
    setSelected(next)
    if (next.length === 3) act('CLOSE_TAB')
  }

  if (tab.minimized) {
    return (
      <button className="minimized-tab" style={{ zIndex: tab.zIndex }} onClick={() => act('RESTORE_TAB')}>
        <span>▣</span>{tab.title.slice(0, 22)}…
      </button>
    )
  }

  return (
    <section
      className={`fake-tab fake-tab--${tab.type} ${tab.maximized ? 'fake-tab--maximized' : ''}`}
      style={{ left: tab.maximized ? 16 : tab.x, top: tab.maximized ? 76 : tab.y, zIndex: tab.zIndex, width: tab.maximized ? 'calc(100% - 32px)' : tab.type === 'infinite-captcha' ? 370 : 350 }}
      onMouseDown={() => act('FOCUS_TAB')}
      aria-label={tab.title}
    >
      <div className="window-titlebar fake-titlebar">
        <div className="window-controls">
          <button className="control-dot control-close" aria-label="Close tab" onClick={() => act('CLOSE_TAB')} />
          <button className="control-dot control-minimize" aria-label="Minimize tab" onClick={() => act('MINIMIZE_TAB')} />
          <button className="control-dot control-maximize" aria-label="Maximize tab" onClick={() => act('TOGGLE_MAXIMIZE')} />
        </div>
        <span className="window-title"><span className="fake-favicon">{tab.type === 'autoplay-video' ? '▶' : tab.type === 'cookie-consent' ? '◉' : '☑'}</span>{tab.title}</span>
      </div>

      {tab.type === 'autoplay-video' && (
        <div className={`video-content ${tab.muted ? 'video-content--muted' : ''}`}>
          <span className="video-live"><i /> NOW PLAYING</span>
          <div className="video-scene"><div className="video-sun" /><div className="video-mountain mountain-one" /><div className="video-mountain mountain-two" /><div className="video-play">▶</div><div className="video-caption">YOU WON’T BELIEVE<br />WHAT HAPPENS NEXT</div></div>
          <div className="video-info"><strong>Productivity Hacks That Actually Work</strong><span>2.4M views · 3 seconds ago</span></div>
          <div className="video-actions"><button className="mute-button" onClick={() => act('MUTE_TAB')}>{tab.muted ? '▶ UNMUTE' : '♫ MUTE'}</button><span>{tab.muted ? 'Audio paused. RAM drain stopped.' : 'AUTOPLAY IS ON · RAM DRAINING'}</span></div>
        </div>
      )}

      {tab.type === 'cookie-consent' && (
        <div className="cookie-content">
          <div className="cookie-brand"><span>◈</span> COOKIE CONSENT SOLUTIONS</div>
          <div className="cookie-icon">🍪</div>
          <h3>We care about<br />your <em>privacy.</em></h3>
          <p>We and our 847 partners use cookies to improve your experience, serve personalized ads, and track your activity across the known universe.</p>
          <div className="cookie-options"><span>☑ Strictly necessary</span><span>☑ Performance</span><span>☑ Targeted ads</span></div>
          <div className="cookie-buttons">
            {COOKIE_FAKE_BUTTONS.map((label) => <button key={label} onClick={onWrongCookie}>{label}</button>)}
            <button
              className="reject-button"
              style={{ top: `${rejectPosition.top}%`, left: `${rejectPosition.left}%` }}
            onMouseLeave={() => setRejectPosition({ top: 68 + Math.random() * 22, left: 8 + Math.random() * 72 })}
            onClick={() => act('CLOSE_TAB')}
            >Reject All</button>
          </div>
          <span className="cookie-legal">By continuing, you agree to our 400-page policy.</span>
        </div>
      )}

      {tab.type === 'infinite-captcha' && (
        <div className="captcha-content">
          <div className="captcha-brand"><span className="captcha-logo">◩</span><span>reCAPTCHA<small>Privacy - Terms</small></span></div>
          <div className="captcha-prompt"><strong>{captcha.prompt}</strong><span>Click verify once there are no more.</span></div>
          <div className={`captcha-grid ${captchaError ? 'captcha-grid--error' : ''}`}>
            {captcha.cells.map((cell, index) => (
              <button key={index} className={`captcha-cell ${selected.includes(index) ? 'captcha-cell--selected' : ''}`} onClick={() => selectCaptcha(index)} aria-label={`Image ${index + 1}${cell.correct ? ', target' : ''}`}>
                <span>{cell.icon}</span>{selected.includes(index) && <i>✓</i>}
              </button>
            ))}
          </div>
          <div className="captcha-bottom"><span>♻ AUDIO</span><span>ⓘ HELP</span><button onClick={() => selected.length === 3 ? act('CLOSE_TAB') : setCaptchaError(true)}>VERIFY</button></div>
        </div>
      )}
    </section>
  )
}
