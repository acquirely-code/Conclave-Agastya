'use client';
// [agastya_testimonials] from the "Agastya Testimonials Slider" plugin. Entries live in data/testimonials.json.
import { useCallback, useEffect, useRef, useState } from 'react';
import testimonials from '@/data/testimonials.json';

const multiline = text => text.split('\n').flatMap((line, i) => (i ? [<br key={i} />, line] : [line]));

export default function Testimonials({ atts = {} }) {
  const autoplay = parseInt(atts.autoplay ?? '5000', 10) || 0;
  const total = testimonials.length;
  const [index, setIndex] = useState(0);
  const timer = useRef(null);
  const touchX = useRef(null);

  const goTo = useCallback(i => setIndex(((i % total) + total) % total), [total]);
  const stop = useCallback(() => {
    clearInterval(timer.current);
    timer.current = null;
  }, []);
  const start = useCallback(() => {
    stop();
    if (autoplay > 0 && total > 1) timer.current = setInterval(() => setIndex(i => (i + 1) % total), autoplay);
  }, [autoplay, total, stop]);
  const userGo = i => {
    goTo(i);
    start();
  };

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  if (!total) {
    return <p style={{ textAlign: 'center', color: '#888' }}>No testimonials yet.</p>;
  }

  return (
    <div
      className="agt-slider"
      data-autoplay={autoplay}
      onMouseEnter={stop}
      onMouseLeave={start}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; stop(); }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) userGo(dx < 0 ? index + 1 : index - 1);
        else start();
      }}
    >
      <div className="agt-viewport">
        <div className="agt-track" style={{ transform: `translateX(${-index * 100}%)` }}>
          {testimonials.map((t, i) => (
            <div className="agt-slide" key={i}>
              <article className="agt-card">
                <div className="agt-photo">{t.image && <img src={t.image} alt={t.name} loading="lazy" />}</div>
                <span className="agt-mark" aria-hidden="true">{'”'}</span>
                <div className="agt-content">
                  <h3 className="agt-name">{t.name}</h3>
                  <p className="agt-body">{multiline(t.body)}</p>
                  {(t.foot1 || t.foot2) && (
                    <div className="agt-footer">
                      {t.foot1 && <div className="agt-foot-item"><span>{multiline(t.foot1)}</span></div>}
                      {t.foot2 && <div className="agt-foot-item"><span>{multiline(t.foot2)}</span></div>}
                    </div>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <div className="agt-controls">
        <button className="agt-arrow agt-prev" aria-label="Previous" onClick={() => userGo(index - 1)} style={total <= 1 ? { display: 'none' } : undefined}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div className="agt-dots">
          {testimonials.map((_, i) => (
            <button key={i} className={`agt-dot${i === index ? ' is-active' : ''}`} type="button" aria-label={`Go to slide ${i + 1}`} onClick={() => userGo(i)}></button>
          ))}
        </div>
        <button className="agt-arrow agt-next" aria-label="Next" onClick={() => userGo(index + 1)} style={total <= 1 ? { display: 'none' } : undefined}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  );
}
