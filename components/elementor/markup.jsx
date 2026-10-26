// Server-rendered inner markup for the interactive widgets (behaviour lives in Interactive.jsx).
import { attachmentImage, iconHtml } from '@/lib/elementor';
import site from '@/data/site.json';
import videos from '@/data/videos.json';
import { Element } from './Element';

const Raw = ({ html, as: Tag = 'span', ...props }) => <Tag {...props} dangerouslySetInnerHTML={{ __html: html }} />;

const PREV_ICON = { value: 'eicon-chevron-left', library: 'eicons' };
const NEXT_ICON = { value: 'eicon-chevron-right', library: 'eicons' };

function SwiperButtons({ s, labels = true }) {
  return (
    <>
      <Raw as="div" className="elementor-swiper-button elementor-swiper-button-prev" role="button" tabIndex={0} aria-label={labels ? 'Previous' : undefined} html={iconHtml(s.navigation_previous_icon?.value ? s.navigation_previous_icon : PREV_ICON)} />
      <Raw as="div" className="elementor-swiper-button elementor-swiper-button-next" role="button" tabIndex={0} aria-label={labels ? 'Next' : undefined} html={iconHtml(s.navigation_next_icon?.value ? s.navigation_next_icon : NEXT_ICON)} />
    </>
  );
}

export function NestedCarouselMarkup({ el, ctx }) {
  const s = el.settings;
  const slides = s.carousel_items || [];
  const autoplay = (s.autoplay ?? 'yes') === 'yes';
  const many = slides.length > 1;
  return (
    <>
      <div className="e-n-carousel swiper" role="region" aria-roledescription="carousel" aria-label={s.carousel_name} dir={s.direction || undefined}>
        <div className="swiper-wrapper" aria-live={autoplay ? 'off' : 'polite'}>
          {slides.map((slide, i) => (
            <div key={slide._id || i} className="swiper-slide" data-slide={i + 1} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
              {el.elements[i] && <Element el={el.elements[i]} ctx={ctx} />}
            </div>
          ))}
        </div>
      </div>
      {(s.arrows ?? 'yes') === 'yes' && many && <SwiperButtons s={s} />}
      {(s.pagination ?? 'bullets') && many && <div className="swiper-pagination"></div>}
    </>
  );
}

export function ImageCarouselMarkup({ id, s }) {
  const items = s.carousel || [];
  const nav = s.navigation || 'both';
  const autoplay = (s.autoplay ?? 'yes') === 'yes';
  return (
    <div className="elementor-image-carousel-wrapper swiper" role="region" aria-roledescription="carousel" aria-label={s.carousel_name} dir={s.direction || 'ltr'}>
      <div className={`elementor-image-carousel swiper-wrapper${s.image_stretch === 'yes' ? ' swiper-image-stretch' : ''}`} aria-live={autoplay ? 'off' : 'polite'}>
        {items.map((item, i) => {
          const img = attachmentImage(item, s.thumbnail_size || 'thumbnail', s.thumbnail_custom_dimension);
          const figure = (
            <figure className="swiper-slide-inner">
              <img className="swiper-slide-image" src={img?.src} alt={img?.alt || ''} />
            </figure>
          );
          const linkTo = s.link_to || 'none';
          const href = linkTo === 'file' ? attachmentImage(item, 'full')?.src : linkTo === 'custom' ? s.link?.url : null;
          return (
            <div key={i} className="swiper-slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`}>
              {href ? (
                <a href={href} data-elementor-open-lightbox={linkTo === 'file' && s.open_lightbox !== 'no' ? 'yes' : undefined} data-elementor-lightbox-slideshow={linkTo === 'file' ? id : undefined}>
                  {figure}
                </a>
              ) : figure}
            </div>
          );
        })}
      </div>
      {items.length > 1 && ['arrows', 'both'].includes(nav) && <SwiperButtons s={s} labels={false} />}
      {items.length > 1 && ['dots', 'both'].includes(nav) && <div className="swiper-pagination"></div>}
    </div>
  );
}

// PHP: substr( hexdec( $id ), 0, 3 )
const idInt = id => String(parseInt(id, 16)).slice(0, 3);

export function AccordionMarkup({ el, ctx }) {
  const s = el.settings;
  const items = s.items || [];
  const TitleTag = s.title_tag || 'div';
  const expanded = (s.default_state || 'expanded') === 'expanded';
  const icon = s.accordion_item_title_icon?.value ? iconHtml(s.accordion_item_title_icon) : '';
  const iconActive = s.accordion_item_title_icon_active?.value ? iconHtml(s.accordion_item_title_icon_active) : icon;
  return (
    <div className="e-n-accordion" aria-label="Accordion. Open links with Enter or Space, close with Escape, and navigate with Arrow Keys">
      {items.map((item, i) => {
        const itemId = item.element_css_id || `e-n-accordion-item-${idInt(el.id)}${i}`;
        const open = expanded && i === 0;
        return (
          <details key={item._id || i} id={itemId} className="e-n-accordion-item" open={open}>
            <summary className="e-n-accordion-item-title" data-accordion-index={i + 1} tabIndex={i === 0 ? 0 : -1} aria-expanded={open ? 'true' : 'false'} aria-controls={itemId}>
              <span className="e-n-accordion-item-title-header">
                <TitleTag className="e-n-accordion-item-title-text"> {item.item_title} </TitleTag>
              </span>
              {icon && (
                <span className="e-n-accordion-item-title-icon">
                  <Raw className="e-opened" html={iconActive} />
                  <Raw className="e-closed" html={icon} />
                </span>
              )}
            </summary>
            {el.elements[i] && <Element el={el.elements[i]} ctx={{ ...ctx, containerProps: { role: 'region', 'aria-labelledby': itemId } }} />}
          </details>
        );
      })}
    </div>
  );
}

export function NavMenuMarkup({ el }) {
  const s = el.settings;
  const layout = s.layout || 'horizontal';
  const pointer = s.pointer ?? 'underline';
  const animationKey = Object.keys(s).find(k => k.startsWith('animation') && s[k]);
  const animation = pointer ? (animationKey ? s[animationKey] : 'fade') : '';
  const mainId = `menu-1-${el.id}`;
  const dropId = `menu-2-${el.id}`;
  const list = (id, dropdown) => (
    <ul id={id} className={`elementor-nav-menu${layout === 'vertical' ? ' sm-vertical' : ''}`}>
      {site.menu.map(item => (
        <li key={item.url} className="menu-item menu-item-type-custom menu-item-object-custom">
          <a href={item.url} className={`elementor-item${item.url.includes('#') ? ' elementor-item-anchor' : ''}`} tabIndex={dropdown ? -1 : undefined}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {layout !== 'dropdown' && (
        <nav aria-label={s.menu_name || undefined} className={`elementor-nav-menu--main elementor-nav-menu__container elementor-nav-menu--layout-${layout}${pointer ? ` e--pointer-${pointer}` : ''}${animation ? ` e--animation-${animation}` : ''}`}>
          {list(mainId, false)}
        </nav>
      )}
      {(s.toggle ?? 'burger') === 'burger' && (
        <div className="elementor-menu-toggle" role="button" tabIndex={0} aria-label="Menu Toggle" aria-expanded="false">
          <i aria-hidden="true" role="presentation" className="elementor-menu-toggle__icon--open eicon-menu-bar"></i>
          <i aria-hidden="true" role="presentation" className="elementor-menu-toggle__icon--close eicon-close"></i>
        </div>
      )}
      <nav className="elementor-nav-menu--dropdown elementor-nav-menu__container" aria-hidden="true">
        {list(dropId, true)}
      </nav>
    </>
  );
}

export function VideoMarkup({ el }) {
  const s = el.settings;
  const type = s.video_type || 'youtube';
  const wistia = videos[el.id]?.wistia;
  const overlay = s.show_image_overlay === 'yes' && s.image_overlay?.url ? attachmentImage(s.image_overlay, s.image_overlay_size || 'full') : null;
  const overlayEl = overlay && (
    <div className="elementor-custom-embed-image-overlay" style={{ backgroundImage: `url(${overlay.src})` }}>
      {(s.show_play_icon ?? 'yes') === 'yes' && (
        <Raw as="div" className="elementor-custom-embed-play" role="button" aria-label={overlay.alt || 'Play Video'} tabIndex={0} html={iconHtml(s.play_icon?.value ? s.play_icon : { value: 'eicon-play', library: 'eicons' })} />
      )}
    </div>
  );

  if (wistia) {
    return (
      <div className="elementor-wrapper elementor-open-inline e-wistia-video">
        <wistia-player media-id={wistia}></wistia-player>
        {overlayEl}
      </div>
    );
  }

  if (type !== 'hosted') {
    // The site only uses self-hosted videos; other providers are rendered as a plain embed.
    const url = s[`${type}_url`];
    const yt = type === 'youtube' && url?.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
    return (
      <div className="elementor-wrapper elementor-open-inline">
        {yt && <iframe className="elementor-video" src={`https://www.youtube.com/embed/${yt}`} allow="autoplay; fullscreen" title="Video"></iframe>}
        {overlayEl}
      </div>
    );
  }

  const src = s.insert_url === 'yes' ? s.external_url?.url : s.hosted_url?.url;
  const missing = /\/Dr-.*\.mp4$/.test(src || ''); // too large to deploy; served from Wistia once an ID is set
  const videoProps = {
    className: 'elementor-video',
    src: missing ? undefined : src,
    controls: (s.controls ?? 'yes') === 'yes',
    preload: s.preload || 'metadata',
    autoPlay: s.autoplay === 'yes' || undefined,
    loop: s.loop === 'yes' || undefined,
    muted: s.mute === 'yes' || undefined,
    playsInline: s.play_on_mobile === 'yes' || undefined,
    controlsList: s.download_button === 'yes' ? undefined : 'nodownload',
    poster: s.poster?.url || undefined,
  };
  return (
    <div className="e-hosted-video elementor-wrapper elementor-open-inline">
      <video {...videoProps}></video>
      {overlayEl}
    </div>
  );
}

// The HTML widget's <script> tags must be re-created on the client to run.
export function splitScripts(html) {
  const scripts = [];
  const rest = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrStr, body) => {
    const attrs = {};
    attrStr.replace(/([\w-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+))?/g, (m, k, v, dq, sq) => {
      attrs[k] = dq ?? sq ?? (v === undefined ? '' : v);
    });
    scripts.push({ attrs, body });
    return '';
  });
  return { html: rest, scripts };
}
