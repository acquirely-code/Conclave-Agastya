// Renders an Elementor element tree with the same markup Elementor 4.3 produces on the frontend.
import { cx, commonWidgetClasses, hideClasses } from '@/lib/elementor';
import { staticWidgets, widgetPrefixClasses } from '@/lib/widgets';
import Interactive from './Interactive';
import { NestedCarouselMarkup, ImageCarouselMarkup, AccordionMarkup, NavMenuMarkup, VideoMarkup, splitScripts } from './markup';
import Shortcode, { SHORTCODE_RE } from '../shortcodes/Shortcode';

// Widgets whose wrapper class differs from their name.
const WRAPPER_NAME = { 'nested-carousel': 'n-carousel', 'nested-accordion': 'n-accordion' };

export function Elements({ elements, ctx }) {
  return elements.map(el => <Element key={el.id} el={el} ctx={ctx} />);
}

export function Element({ el, ctx = {} }) {
  return el.elType === 'container' ? <Container el={el} ctx={ctx} /> : <Widget el={el} ctx={ctx} />;
}

function Container({ el, ctx }) {
  const s = el.settings || {};
  const boxed = (s.content_width || 'boxed') === 'boxed';
  const Tag = s.link?.url ? 'a' : s.html_tag || 'div';
  const className = cx(
    'elementor-element', `elementor-element-${el.id}`,
    `e-${s.container_type || 'flex'}`, `e-con-${boxed ? 'boxed' : 'full'}`,
    s.css_classes, hideClasses(s),
    'e-con', el.isInner ? 'e-child' : 'e-parent',
  );
  const props = {
    className,
    id: s._element_id?.trim() || undefined,
    'data-id': el.id,
    'data-element_type': 'container',
    'data-e-type': 'container',
    ...(s.link?.url ? { href: s.link.url } : {}),
    ...(ctx.containerProps || {}),
  };
  const childCtx = { ...ctx, containerProps: undefined };
  const children = <Elements elements={el.elements || []} ctx={childCtx} />;
  return <Tag {...props}>{boxed ? <div className="e-con-inner">{children}</div> : children}</Tag>;
}

function Widget({ el, ctx }) {
  const s = el.settings || {};
  const name = el.widgetType;
  const className = cx(
    'elementor-element', `elementor-element-${el.id}`,
    widgetPrefixClasses[name]?.(s) || [],
    commonWidgetClasses(s),
    'elementor-widget', `elementor-widget-${WRAPPER_NAME[name] || name}`,
    name === 'theme-site-logo' && 'elementor-widget-image',
  );
  const wrapper = {
    className,
    id: s._element_id?.trim() || undefined,
    'data-id': el.id,
    'data-element_type': 'widget',
    'data-e-type': 'widget',
    'data-widget_type': `${name}.default`,
  };

  switch (name) {
    case 'nested-carousel':
      return <Interactive kind="nested-carousel" id={el.id} settings={s} {...wrapper}><NestedCarouselMarkup el={el} ctx={ctx} /></Interactive>;
    case 'image-carousel':
      return <Interactive kind="image-carousel" id={el.id} settings={s} {...wrapper}><ImageCarouselMarkup id={el.id} s={s} /></Interactive>;
    case 'nested-accordion':
      return <Interactive kind="nested-accordion" id={el.id} settings={s} {...wrapper}><AccordionMarkup el={el} ctx={ctx} /></Interactive>;
    case 'nav-menu':
      return <Interactive kind="nav-menu" id={el.id} settings={s} {...wrapper}><NavMenuMarkup el={el} /></Interactive>;
    case 'video':
      return <Interactive kind="video" id={el.id} settings={s} {...wrapper}><VideoMarkup el={el} /></Interactive>;
    case 'html': {
      if (!s.html) return null;
      const { html, scripts } = splitScripts(s.html);
      return <Interactive kind="html" id={el.id} settings={{ scripts }} {...wrapper} html={html} />;
    }
    case 'shortcode':
      return <div {...wrapper}><div className="elementor-shortcode"><Shortcode code={s.shortcode || ''} /></div></div>;
    case 'text-editor': {
      // A text block that only holds a shortcode: the browser closes the <p> around the shortcode's <div>.
      const m = (s.editor || '').match(SHORTCODE_RE);
      if (m && (s.editor || '').replace(/<!--[\s\S]*?-->|<\/?p>|\s/g, '') === m[0]) {
        return <div {...wrapper}><p></p><Shortcode code={m[0]} /><p></p></div>;
      }
      const html = staticWidgets['text-editor'](s);
      return html ? <div {...wrapper} dangerouslySetInnerHTML={{ __html: html }} /> : null;
    }
    default: {
      const render = staticWidgets[name];
      if (!render) {
        console.warn(`Unsupported Elementor widget: ${name} (${el.id})`);
        return null;
      }
      // Elementor does not print a widget at all when its render() output is empty.
      const html = render(s);
      return html ? <div {...wrapper} dangerouslySetInnerHTML={{ __html: html }} /> : null;
    }
  }
}
