import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { assistantContent } from './assistantContent.js'
import { socials } from './content.js'
import './flowerAssistant.css'

function FlowerIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M12 9.7c-1.4-4.4.6-6.7 2.6-5.5 1.3.8 1.2 2.7-.1 5.5 3.7-2.8 6.4-2 6.3.4-.1 1.6-1.8 2.4-5.2 2.6 4.5 1.1 5.6 3.4 3.7 4.5-1.2.7-2.8.1-5.1-2.1 1 4.4-.5 6.5-2.7 5.1-1.3-.8-1.1-2.7.2-5.3-3.8 2.7-6.5 1.9-6.3-.4.1-1.6 1.9-2.4 5.2-2.5-4.5-1-5.6-3.3-3.7-4.4 1.3-.8 2.9-.2 5.2 2.1Z" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
  </svg>
}

function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19" /></svg>
}

function SendIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
}

export default function FlowerAssistant({ language, inquiryLabel }) {
  const t = assistantContent[language]
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [suppressed, setSuppressed] = useState(false)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const launcher = useRef(null)
  const dialog = useRef(null)
  const closeButton = useRef(null)
  const scrollArea = useRef(null)
  const sequence = useRef(0)
  const replyTimer = useRef(null)
  const closeTimer = useRef(null)
  const closing = useRef(false)
  const suppressedRef = useRef(false)
  suppressedRef.current = suppressed

  // The main Instagram action and footer take precedence over a floating control.
  useEffect(() => {
    const targets = [document.querySelector('.pickup-actions'), document.querySelector('.site-footer')].filter(Boolean)
    const visible = new Map(targets.map(target => [target, false]))
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting)
      setSuppressed([...visible.values()].some(Boolean))
    })
    targets.forEach(target => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    window.clearTimeout(replyTimer.current)
    window.clearTimeout(closeTimer.current)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const panel = dialog.current
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    panel.showModal()
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    document.body.style.overflow = 'hidden'
    closeButton.current.focus({ preventScroll: true })
    const frame = requestAnimationFrame(() => setIsVisible(true))

    const viewport = window.visualViewport
    const updateViewport = () => {
      panel.style.setProperty('--flower-viewport-height', `${viewport?.height ?? window.innerHeight}px`)
      panel.style.setProperty('--flower-viewport-top', `${viewport?.offsetTop ?? 0}px`)
    }
    updateViewport()
    viewport?.addEventListener('resize', updateViewport)
    viewport?.addEventListener('scroll', updateViewport)

    return () => {
      cancelAnimationFrame(frame)
      viewport?.removeEventListener('resize', updateViewport)
      viewport?.removeEventListener('scroll', updateViewport)
      if (panel.open) panel.close()
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      const focusTarget = suppressedRef.current
        ? document.querySelector('.pickup-actions .button, .site-footer a')
        : launcher.current
      focusTarget?.focus({ preventScroll: true })
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (isOpen && scrollArea.current) {
      scrollArea.current.scrollTop = messages.length || isTyping ? scrollArea.current.scrollHeight : 0
    }
  }, [isOpen, messages, isTyping, language])

  const openPanel = () => {
    window.clearTimeout(closeTimer.current)
    closing.current = false
    setIsOpen(true)
  }

  const closePanel = () => {
    if (closing.current) return
    closing.current = true
    setIsVisible(false)
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160
    closeTimer.current = window.setTimeout(() => setIsOpen(false), delay)
  }

  const send = (text, questionIndex = null) => {
    const value = text.trim()
    if (!value || replyTimer.current !== null) return
    setMessages(current => [...current, { id: ++sequence.current, role: 'user', questionIndex, text: questionIndex === null ? value : null }])
    setIsTyping(true)
    replyTimer.current = window.setTimeout(() => {
      setMessages(current => [...current, { id: ++sequence.current, role: 'assistant', answerIndex: questionIndex }])
      setIsTyping(false)
      replyTimer.current = null
    }, 650)
  }

  const submit = event => {
    event.preventDefault()
    const value = draft.trim()
    if (!value || isTyping) return
    send(value)
    setDraft('')
  }

  return <>
    <button ref={launcher} className="flower-chat-launcher" type="button" aria-label={t.launcher} aria-haspopup="dialog" aria-expanded={isOpen} aria-controls="flower-chat-panel" tabIndex={suppressed && !isOpen ? -1 : 0} hidden={suppressed && !isOpen} onClick={openPanel}>
      <FlowerIcon /><span className="flower-chat-launcher-label">{t.launcher}</span>
    </button>
    <dialog ref={dialog} id="flower-chat-panel" className="flower-chat-panel" data-visible={isVisible} aria-labelledby="flower-chat-title" aria-describedby="flower-chat-subtitle" onCancel={event => { event.preventDefault(); closePanel() }} onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel()
    }}>
      <header className="flower-chat-header">
        <span className="flower-chat-mark" aria-hidden="true">e.</span>
        <div className="flower-chat-heading"><div className="flower-chat-title-row"><h2 id="flower-chat-title">{t.title}</h2><span className="flower-chat-demo">{t.demo}</span></div><p id="flower-chat-subtitle">{t.subtitle}</p></div>
        <button ref={closeButton} className="flower-chat-close" type="button" aria-label={t.close} onClick={closePanel}><CloseIcon /></button>
      </header>

      <div className="flower-chat-scroll" ref={scrollArea} role="region" aria-label={t.conversation} tabIndex={0}>
        <div className="flower-chat-message is-assistant flower-chat-welcome"><span className="flower-chat-author">ewi.blumen</span><p>{t.welcome}</p></div>
        {messages.length === 0 && !isTyping && <div className="flower-chat-example" role="group" aria-label={t.exampleLabel}>
          <p className="flower-chat-example-label">{t.exampleLabel}</p>
          <div className="flower-chat-message is-user"><span className="flower-chat-author">{t.you}</span><p>{t.exampleQuestion}</p></div>
          <div className="flower-chat-message is-assistant"><span className="flower-chat-author">ewi.blumen</span><p>{t.exampleAnswer}</p></div>
        </div>}
        <div className="flower-chat-log" role="log" aria-label={t.conversation} aria-live="polite" aria-relevant="additions">
          {messages.map(message => <div key={message.id} className={`flower-chat-message is-${message.role}`}>
            <span className="flower-chat-author">{message.role === 'user' ? t.you : 'ewi.blumen'}</span>
            <p>{message.role === 'user' ? message.questionIndex === null ? message.text : t.questions[message.questionIndex] : message.answerIndex === null ? t.fallback : t.answers[message.answerIndex]}</p>
          </div>)}
        </div>
        {isTyping && <div className="flower-chat-typing" role="status"><span className="flower-chat-dots" aria-hidden="true"><i /><i /><i /></span>{t.typing}</div>}
        <div className="flower-chat-questions" role="group" aria-label={t.questionsLabel}>
          {t.questions.map((question, index) => <button key={index} type="button" disabled={isTyping} onClick={() => send(question, index)}>{question}</button>)}
        </div>
      </div>

      <div className="flower-chat-footer">
        <p className="flower-chat-contact">{t.contact} <a href={socials.instagram} target="_blank" rel="noopener noreferrer">{inquiryLabel} <span aria-hidden="true">↗</span></a></p>
        <form className="flower-chat-form" onSubmit={submit}>
          <input type="text" value={draft} maxLength="400" onChange={event => setDraft(event.target.value)} placeholder={t.placeholder} aria-label={t.inputLabel} />
          <button type="submit" disabled={!draft.trim() || isTyping} aria-label={t.send}><SendIcon /></button>
        </form>
      </div>
    </dialog>
  </>
}
