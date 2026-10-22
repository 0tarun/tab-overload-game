import { useState } from 'react'
import { useGame } from '../game/useGame'
import { LAG_THRESHOLD, WORK_PARAGRAPH } from '../game/content'

export function MainWorkWindow() {
  const { state, dispatch } = useGame()
  const [input, setInput] = useState('')
  const [lastAcceptedAt, setLastAcceptedAt] = useState(0)

  const onChange = (value: string) => {
    const addition = value.slice(input.length)
    if (!addition) {
      setInput(input)
      return
    }
    let accepted = input
    let acceptedAt = lastAcceptedAt
    for (const char of addition) {
      if (state.ram >= LAG_THRESHOLD) {
        const now = Date.now()
        if (now - acceptedAt < 130) continue
        acceptedAt = now
      }
      const expected = WORK_PARAGRAPH[state.typedChars + accepted.length - input.length]
      const correct = char === expected
      dispatch({ type: 'TYPE_CHAR', correct, timestamp: Date.now() })
      if (correct) accepted += char
    }
    setInput(accepted)
    if (acceptedAt !== lastAcceptedAt) setLastAcceptedAt(acceptedAt)
  }

  const completed = WORK_PARAGRAPH.slice(0, state.typedChars)
  const remaining = WORK_PARAGRAPH.slice(state.typedChars)

  return (
    <section className="work-window" aria-label="Main work task">
      <div className="window-titlebar work-titlebar">
        <div className="window-controls"><span className="control-dot control-close" /><span className="control-dot control-minimize" /><span className="control-dot control-maximize" /></div>
        <span className="window-title"><span className="document-icon">▤</span> Q3_STRATEGY_MEMO_FINAL_v7.doc</span>
        <span className="window-tag">PRIORITY</span>
      </div>
      <div className="work-content">
        <div className="document-meta"><span>TO: THE ENTIRE TEAM</span><span>FROM: MANAGEMENT</span><span>SUBJECT: QUICK THOUGHTS</span></div>
        <h2>One quick thing…</h2>
        <p className="work-instruction">Type the memo exactly as written. No pressure.</p>
        <div className="target-copy" aria-label="Text to type">
          <span className="typed-copy">{completed}</span><span className="current-copy">{remaining.charAt(0)}</span><span>{remaining.slice(1)}</span>
        </div>
        <label className="typing-label" htmlFor="memo-input">YOUR REPLY <span>· {state.typedChars} / {WORK_PARAGRAPH.length} CHARACTERS</span></label>
        <textarea
          id="memo-input"
          className="typing-input"
          value={input}
          onChange={(event) => onChange(event.target.value)}
          onPaste={(event) => {
            event.preventDefault()
            onChange(input + (event.clipboardData.getData('text') || ''))
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoFocus
          aria-label="Type the memo here"
          placeholder="Start typing the memo here…"
        />
        <div className="work-window-footer"><span><i className="saved-dot" /> SAVED TO THIS DEVICE</span><span>WORDS: {input.trim() ? input.trim().split(/\s+/).length : 0}</span></div>
      </div>
    </section>
  )
}
