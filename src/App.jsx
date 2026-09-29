import { Fragment, useEffect, useRef, useState } from 'react'
import { content, galleryFiles, galleryOrder, socials } from './content.js'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import FlowerAssistant from './FlowerAssistant.jsx'

const imageUrl = (file, width) => `/images/${file.replace(/\.[^.]+$/, '')}-${width}.webp`
const imageSrcSet = file => [480, 800, 1200].map(width => `${imageUrl(file, width)} ${width}w`).join(', ')
const gallerySizes = '(min-width: 1256px) 368px, (min-width: 1024px) calc((100vw - 152px) / 3), (min-width: 600px) calc((100vw - 88px) / 2), calc(100vw - 40px)'

function GalleryCard({ index, position, t, onSelect }) {
  const file = galleryFiles[index]
  return <figure className="gallery-card">
    <button className="photo-button" onClick={() => onSelect(index)} aria-label={`${t.enlarge}: ${t.galleryCaptions[index]}`} aria-haspopup="dialog">
      <img src={imageUrl(file, 800)} srcSet={imageSrcSet(file)} sizes={gallerySizes} alt={t.galleryAlts[index]} width="1200" height="1600" loading="lazy" decoding="async" />
      <span className="photo-expand" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 4h6v6M10 20H4v-6M20 4l-6 6M4 20l6-6" /></svg></span>
    </button>
    <figcaption><span>{t.galleryCaptions[index]}</span><span className="photo-number" aria-hidden="true">{String(position + 1).padStart(2, '0')}</span></figcaption>
  </figure>
}

function Arrow({ diagonal = false }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} /></svg>
}

function SocialLink({ type = 'instagram', className = '', children }) {
  return <a className={className} href={socials[type]} target="_blank" rel="noopener noreferrer">{children}<Arrow diagonal /></a>
}

function SectionHeading({ eyebrow, title, children }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children && <p className="section-intro">{children}</p>}</div>
}

function Lightbox({ selected, onClose, t }) {
  const dialog = useRef(null)
  useEffect(() => {
    if (selected === null) return
    const element = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [selected])

  return <dialog ref={dialog} className="lightbox" aria-labelledby="lightbox-caption" onCancel={onClose} onKeyDown={(event) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      dialog.current.querySelector('button').focus()
    }
  }} onClick={(event) => {
    if (event.target !== event.currentTarget) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
  }}>
    {selected !== null && <>
      <button className="lightbox-close" onClick={onClose} aria-label={t.close} autoFocus><span aria-hidden="true">×</span></button>
      <figure><img src={imageUrl(galleryFiles[selected], 1200)} alt={t.galleryAlts[selected]} width="1200" height="1600" /><figcaption id="lightbox-caption">{t.galleryCaptions[selected]}</figcaption></figure>
    </>}
  </dialog>
}

export default function App() {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('ewi-language')
      return Object.hasOwn(content, saved) ? saved : 'de'
    } catch { return 'de' }
  })
  const [selected, setSelected] = useState(null)
  const [galleryExpanded, setGalleryExpanded] = useState(false)
  const t = content[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.title = t.metaTitle
    document.querySelector('meta[name="description"]').content = t.metaDescription
    document.querySelector('meta[property="og:title"]').content = t.metaTitle
    document.querySelector('meta[property="og:description"]').content = t.metaDescription
    document.querySelector('meta[property="og:locale"]').content = t.locale
    try { localStorage.setItem('ewi-language', language) } catch { /* Storage is optional. */ }
  }, [language, t])

  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <header className="site-header container">
      <a className="wordmark" href="#home" aria-label={t.home}>ewi<span>.</span>blumen</a>
      <nav className="main-nav" aria-label={t.navigation}>
        {['works', 'offer', 'order'].map((id, i) => <a href={`#${id}`} key={id}>{t.nav[i]}</a>)}
      </nav>
      <LanguageSwitcher language={language} onChange={setLanguage} label={t.language} />
    </header>

    <main id="main" tabIndex="-1">
      <section className="hero container" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">{t.eyebrow}</p>
          <h1 id="hero-title">{t.heroStart}{' '}<em>{t.heroEnd}</em></h1>
          <p className="hero-description">{t.heroText}</p>
          <div className="hero-actions"><SocialLink className="button button-primary">{t.primary}</SocialLink><a className="text-link" href="#works">{t.secondary}<Arrow /></a></div>
          <p className="location-note"><span className="location-marker" aria-hidden="true">⌖</span>{t.location}<span className="note-divider" aria-hidden="true">·</span><span>{t.noDelivery}</span></p>
        </div>
        <figure className="hero-figure"><img src={imageUrl('IMG_3649.JPG', 800)} srcSet={imageSrcSet('IMG_3649.JPG')} sizes="(min-width: 1200px) 480px, (min-width: 1024px) 440px, (min-width: 720px) calc((100vw - 96px) / 2), (min-width: 600px) 480px, calc(100vw - 40px)" alt={t.heroAlt} width="1200" height="1600" loading="eager" fetchPriority="high" /><figcaption>{t.heroCaption}</figcaption></figure>
      </section>

      <section className="gallery-section container section" id="works" aria-labelledby="works-title">
        <div className="section-heading"><p className="eyebrow">{t.galleryEyebrow}</p><h2 id="works-title">{t.galleryTitle}</h2><p className="section-intro">{t.galleryIntro}</p></div>
        <div className="gallery-grid">{galleryOrder.slice(0, 6).map((index, position) => <Fragment key={galleryFiles[index]}>
          <GalleryCard index={index} position={position} t={t} onSelect={setSelected} />
          {position === 2 && <div className="gallery-followup"><SocialLink className="text-link">{t.primary}</SocialLink><p>{t.galleryMicrocopy}</p></div>}
        </Fragment>)}</div>
        <div className="gallery-disclosure"><button className="button gallery-toggle" aria-expanded={galleryExpanded} aria-controls="more-works" onClick={() => setGalleryExpanded(value => !value)}>{galleryExpanded ? t.galleryLess : t.galleryMore}<span aria-hidden="true">{galleryExpanded ? '−' : '+'}</span></button></div>
        <div id="more-works" className="gallery-grid gallery-extra" hidden={!galleryExpanded}>
          {galleryExpanded && galleryOrder.slice(6).map((index, position) => <GalleryCard key={galleryFiles[index]} index={index} position={position + 6} t={t} onSelect={setSelected} />)}
        </div>
      </section>

      <section className="offer-section section" id="offer"><div className="container">
        <SectionHeading eyebrow={t.categoriesEyebrow} title={t.categoriesTitle} />
        <div className="category-grid">{t.categories.map(([title, text], i) => <article className="category-card" key={i}><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div></section>

      <section className="order-section container section" id="order">
        <SectionHeading eyebrow={t.orderEyebrow} title={t.orderTitle} />
        <ol className="steps">{t.steps.map(([title, text], i) => <li className="step-card" key={i}><span className="step-number" aria-hidden="true">{i + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
        <div className="price-note"><p>{t.priceBasis}</p><p>{t.priceAgreement}</p></div>
        <SocialLink className="button button-primary">{t.primary}</SocialLink>
      </section>

      <section className="about-section container section" id="handmade">
        <SectionHeading eyebrow={t.aboutEyebrow} title={t.aboutTitle} />
        <div className="about-copy"><p>{t.aboutText}</p><span className="about-signature" aria-hidden="true">ewi.blumen</span></div>
      </section>

      <section className="pickup-section" id="stuttgart"><div className="container pickup-inner">
        <p className="eyebrow">{t.pickupEyebrow}</p><h2>{t.pickupTitle}</h2><p className="pickup-description">{t.pickupText}</p>
        <div className="pickup-actions"><SocialLink className="button button-primary">{t.primary}</SocialLink><SocialLink type="tiktok" className="text-link">{t.tiktok}</SocialLink></div>
        <div className="pickup-details"><p>{t.location}<span aria-hidden="true"> · </span>{t.noDelivery}</p><p>{t.pickupNote}</p></div>
      </div></section>
    </main>

    <footer className="site-footer container"><div><a href="#home" className="wordmark" aria-label={t.home}>ewi<span>.</span>blumen</a><p>{t.footerText}</p></div><div className="footer-socials"><SocialLink>Instagram</SocialLink><SocialLink type="tiktok">TikTok</SocialLink></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ewi.blumen</span><span>{t.footerNote}</span></div></footer>
    <Lightbox selected={selected} onClose={() => setSelected(null)} t={t} />
    <FlowerAssistant language={language} inquiryLabel={t.primary} />
  </>
}
