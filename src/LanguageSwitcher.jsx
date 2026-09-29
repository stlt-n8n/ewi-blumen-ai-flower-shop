import { useEffect, useRef, useState } from 'react'
import { languages } from './content.js'

export default function LanguageSwitcher({ language, onChange, label }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const trigger = useRef(null)
  const options = useRef(null)
  const current = languages.find(item => item.code === language)

  useEffect(() => {
    if (!open) return
    options.current.querySelector('[aria-pressed="true"]').focus()
    const closeOutside = event => {
      if (!root.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 600px)')
    const handleBreakpoint = () => {
      const hadFocus = root.current.contains(document.activeElement)
      setOpen(false)
      if (hadFocus) {
        const target = desktop.matches
          ? root.current.querySelector('.language-inline [aria-pressed="true"]')
          : trigger.current
        target.focus()
      }
    }
    desktop.addEventListener('change', handleBreakpoint)
    return () => desktop.removeEventListener('change', handleBreakpoint)
  }, [])

  const select = code => {
    onChange(code)
    setOpen(false)
    trigger.current.focus()
  }

  const navigateOptions = event => {
    const buttons = [...options.current.querySelectorAll('button')]
    const index = buttons.indexOf(document.activeElement)
    let next
    if (event.key === 'ArrowDown') next = (index + 1) % buttons.length
    if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = buttons.length - 1
    if (next !== undefined) {
      event.preventDefault()
      buttons[next].focus()
    }
  }

  return <div ref={root} className={`language-switch${open ? ' is-open' : ''}`} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }} onKeyDown={event => {
    if (open && event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      trigger.current.focus()
    }
  }}>
    <div className="language-inline" role="group" aria-label={label}>
      {languages.map(item => <button key={item.code} type="button" lang={item.code} aria-label={item.name} aria-pressed={language === item.code} onClick={() => onChange(item.code)}>{item.label}</button>)}
    </div>
    <button ref={trigger} className="language-trigger" type="button" aria-label={`${label}: ${current.label} (${current.name})`} aria-expanded={open} aria-controls="language-options" onClick={() => setOpen(value => !value)} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setOpen(true)
      }
    }}>{current.label}<span aria-hidden="true">▾</span></button>
    <div ref={options} id="language-options" className="language-options" role="group" aria-label={label} hidden={!open} onKeyDown={navigateOptions}>
      {languages.map(item => <button key={item.code} type="button" lang={item.code} aria-pressed={language === item.code} onClick={() => select(item.code)}>{item.name}<span aria-hidden="true">{language === item.code ? '✓' : ''}</span></button>)}
    </div>
  </div>
}
