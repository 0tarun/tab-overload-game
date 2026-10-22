import { useState } from 'react'
import { useGame } from '../game/useGame'
import { BSOD_ERROR_CODES, LAG_THRESHOLD, WIN_QUOTES } from '../game/content'
import { FakeTab } from './FakeTab'
import { MainWorkWindow } from './MainWorkWindow'
import { useHighscores, type Highscore } from '../hooks/useHighscores'

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export function GameContainer() {
  const { state, dispatch, progress } = useGame()
  const { scores, error, submitScore, refresh } = useHighscores()
  const [playerName, setPlayerName] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [savedRun, setSavedRun] = useState<number | null>(null)
  const lagging = state.ram >= LAG_THRESHOLD && state.status === 'playing'

  const onSaveScore = async () => {
    try {
      const score = await submitScore({
        playerName: playerName.trim() || 'Anonymous',
        timeRemaining: state.timeRemaining,
        workProgress: progress,
      })
      setSavedRun(state.runId)
      setSaveMessage(`Score saved — #${score.rank} on the leaderboard!`)
      void refresh()
    } catch (cause) {
      setSaveMessage(cause instanceof Error ? cause.message : 'Could not save your score.')
    }
  }

  const start = () => {
    setPlayerName('')
    setSaveMessage('')
    setSavedRun(null)
    dispatch({ type: 'START_RUN' })
  }

  return (
    <main className={`desktop ${lagging ? 'desktop--lagging' : ''}`}>
      <div className="desktop-wallpaper" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#" aria-label="Tab Overload home"><span className="brand-mark">▦</span> tab<span>overload</span></a>
        <div className="topbar-center"><span className="status-dot animate-pulse" /> REMOTE DESKTOP <span className="topbar-divider">/</span> PRODUCTIVITY SUITE v2.4</div>
        <div className="topbar-user"><span className="avatar">Y</span> YOUR WORKSPACE</div>
      </header>

      <section className="game-stage">
        <div className="stage-heading">
          <div><span className="eyebrow">MONDAY, 9:02 AM · YOUR DESK</span><h1>One task. <em>A million distractions.</em></h1></div>
          {state.status === 'playing' && (
            <div className="timer-chip"><span className="timer-icon">◷</span><span className="timer-caption">TIME LEFT</span><strong>{formatTime(state.timeRemaining)}</strong></div>
          )}
        </div>

        <div className="hud">
          <div className="hud-metric work-metric">
            <div className="metric-label"><span>MAIN TASK</span><strong>{progress}%</strong></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          </div>
          <div className={`hud-metric ram-metric ${state.ram >= LAG_THRESHOLD ? 'ram-metric--hot' : ''}`}>
            <div className="metric-label"><span><i className="ram-led" /> SYSTEM RAM</span><strong>{Math.round(state.ram)}%</strong></div>
            <div className="progress-track"><div className="ram-fill" style={{ width: `${state.ram}%` }} /></div>
          </div>
          <div className="tabs-count"><span className="tabs-count-icon">▣</span><strong>{state.tabs.length}</strong><small>OPEN TABS</small></div>
        </div>

        <div className="workspace">
          <div className="workspace-grid" aria-hidden="true" />
          {state.status === 'playing' && <MainWorkWindow key={state.runId} />}
          {state.tabs.map((tab) => (
            <FakeTab key={tab.id} tab={tab} onWrongCookie={() => dispatch({ type: 'SPAWN_TAB' })} />
          ))}
          {state.status !== 'playing' && (
            <div className="overlay">
              {state.status === 'ready' && (
                <section className="intro-card">
                  <div className="intro-icon">⌘</div>
                  <span className="eyebrow">THE DAILY GRIND · LEVEL 01</span>
                  <h2>Can you get it<br /><em>over the line?</em></h2>
                  <p>Type the work memo perfectly before the tabs take over. Mute videos, reject cookies, and prove you’re not a robot.</p>
                  <div className="intro-meta"><span>◷ 2 MINUTES</span><span>▤ DISTRACTIONS EVERY 4 SEC</span></div>
                  <button className="primary-button" onClick={start}>START YOUR SHIFT <span>→</span></button>
                </section>
              )}
              {state.status === 'crashed' && (
                <section className="ending-card crash-card">
                  <div className="crash-face">:(</div><span className="eyebrow">YOUR COMPUTER RAN INTO A PROBLEM</span>
                  <h2>Browser <em>overload.</em></h2>
                  <p>Your tabs have unionized. We’re collecting some error information, and then we’ll restart for you.</p>
                  <code>{BSOD_ERROR_CODES[Math.floor(state.runId % BSOD_ERROR_CODES.length)]}</code>
                  <button className="primary-button" onClick={start}>REBOOT &amp; TRY AGAIN <span>↻</span></button>
                </section>
              )}
              {state.status === 'timeout' && (
                <section className="ending-card">
                  <div className="ending-emoji">⌛</div><span className="eyebrow">THE CLOCK RAN OUT</span>
                  <h2>So close. <em>So many tabs.</em></h2>
                  <p>You got {progress}% of the task done. Take a breath, close a few tabs, and give it another shot.</p>
                  <button className="primary-button" onClick={start}>CLOCK BACK IN <span>→</span></button>
                </section>
              )}
              {state.status === 'won' && (
                <section className="ending-card win-card">
                  <div className="ending-emoji">✦</div><span className="eyebrow">INBOX ZERO-ISH · TASK COMPLETE</span>
                  <h2>You did the <em>thing.</em></h2>
                  <p>{WIN_QUOTES[state.runId % WIN_QUOTES.length]}</p>
                  <div className="score-form">
                    <input aria-label="Player name" maxLength={24} placeholder="Your name (optional)" value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
                    <button className="primary-button" onClick={() => void onSaveScore()} disabled={savedRun === state.runId}>SAVE SCORE</button>
                  </div>
                  {saveMessage && <p className="save-message" role="status">{saveMessage}</p>}
                  <button className="text-button" onClick={start}>PLAY AGAIN ↗</button>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="desktop-footer">
          <span><i className="connection-led" /> ALL SYSTEMS {lagging ? 'STRUGGLING' : 'NOMINAL'}</span>
          <span>TIP: CLOSE AUTOPLAY TABS BEFORE THEY CLOSE YOU</span>
          <span>BUILD 0.9.2 <span className="footer-separator">·</span> YOUR COMPUTER IS FINE</span>
        </div>
      </section>

      <aside className="leaderboard">
        <div className="leaderboard-title"><div><span className="eyebrow">THE SURVIVORS</span><h2>Hall of <em>focus.</em></h2></div><button className="refresh-button" onClick={() => void refresh()} aria-label="Refresh leaderboard">↻</button></div>
        {error ? <p className="leaderboard-note">Leaderboard offline. Start the backend to save scores.</p> : scores.length === 0 ? <p className="leaderboard-note">No survivors yet. Make history.</p> : (
          <ol className="score-list">{scores.slice(0, 10).map((score: Highscore, index) => (
            <li key={score.id}><span className="rank">{String(index + 1).padStart(2, '0')}</span><span className="score-name">{score.playerName}</span><span className="score-time">{formatTime(score.timeRemaining)}</span></li>
          ))}</ol>
        )}
        <div className="leaderboard-foot"><span>YOUR BEST RUN STARTS NOW</span><span>↗</span></div>
      </aside>

      {lagging && <div className="lag-indicator" role="status">SYSTEM LAG · {Math.round(state.ram)}% RAM</div>}
    </main>
  )
}
