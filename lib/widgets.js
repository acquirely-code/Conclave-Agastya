// Static Elementor widgets rendered to HTML strings, mirroring each widget's PHP render().
import { attachmentImage, attrs, cx, esc, iconHtml, imgHtml, linkAttrs, responsiveClasses } from './elementor';
import { wptexturize } from './texturize';
import site from '@/data/site.json';

const isEmpty = v => v === '' || v === null || v === undefined;

// Wrapper classes produced by each widget's `prefix_class` controls (see Element_Base::add_render_attributes).
export const widgetPrefixClasses = {
  'icon-box': s => {
    if (!s.selected_icon?.value) return [];
    const view = s.view || 'default';
    return [`elementor-view-${view}`, view !== 'default' ? `elementor-shape-${s.shape || 'circle'}` : '', responsiveClasses(s, 'position', 'elementor%s-position-', 'block-start')];
  },
  icon: s => {
    const view = s.view || 'default';
    return [`elementor-view-${view}`, view !== 'default' ? `elementor-shape-${s.shape || 'circle'}` : ''];
  },
  'image-box': s => {
    if (!s.image?.url) return [];
    const pos = responsiveClasses(s, 'position', 'elementor-position-', 'top');
    return [pos, (s.position || 'top') !== 'top' ? responsiveClasses(s, 'content_vertical_alignment', 'elementor-vertical-align-', 'top') : ''];
  },
  'icon-list': s => [`elementor-icon-list--layout-${s.view || 'traditional'}`, `elementor-list-item-link-${s.link_click || 'full_width'}`, responsiveClasses(s, 'icon_align', 'elementor%s-align-')],
  'image-carousel': s => {
    const nav = s.navigation || 'both';
    return [['arrows', 'both'].includes(nav) ? `elementor-arrows-position-${s.arrows_position || 'inside'}` : '', ['dots', 'both'].includes(nav) ? `elementor-pagination-position-${s.dots_position || 'outside'}` : ''];
  },
  divider: s => [`elementor-widget-divider--view-${s.look || 'line'}`],
  button: s => [responsiveClasses(s, 'align', 'elementor%s-align-')],
  'nested-carousel': s => {
    const pagination = s.pagination ?? 'bullets';
    return [
      (s.arrows ?? 'yes') === 'yes' ? responsiveClasses(s, 'arrows_position', 'elementor-arrows-position-', 'inside') : '',
      pagination ? `elementor-pagination-type-${pagination}` : '',
      pagination === 'bullets' ? `elementor-pagination-position-${s.dots_position || 'outside'}` : '',
      pagination === 'fraction' ? `elementor-pagination-position-${s.fraction_position || 'outside'}` : '',
    ];
  },
  'nav-menu': s => [
    s.layout !== 'dropdown' && s.align_items ? `elementor-nav-menu__align-${s.align_items}` : '',
    `elementor-nav-menu--dropdown-${s.dropdown || 'tablet'}`,
    s.full_width === 'stretch' ? 'elementor-nav-menu--stretch' : '',
    `elementor-nav-menu__text-align-${s.text_align || 'aside'}`,
    (s.toggle ?? 'burger') ? `elementor-nav-menu--toggle elementor-nav-menu--${s.toggle ?? 'burger'}` : '',
  ],
};

function imageLink(s, image) {
  const linkTo = s.link_to || 'none';
  if (linkTo === 'none') return '';
  if (linkTo === 'custom') return s.link?.url ? linkAttrs(s.link) : '';
  return attrs({ href: image.url, 'data-elementor-open-lightbox': s.open_lightbox === 'no' ? 'no' : 'yes' });
}

export const staticWidgets = {
  heading(s) {
    if (isEmpty(s.title)) return '';
    let title = s.title;
    if (s.link?.url) title = `<a ${linkAttrs(s.link)}>${title}</a>`;
    const tag = s.header_size || 'h2';
    return `<${tag} class="elementor-heading-title elementor-size-${s.size || 'default'}">${title}</${tag}>`;
  },

  'text-editor'(s) {
    return wptexturize(s.editor || '');
  },

  'icon-box'(s) {
    const hasLink = !!s.link?.url;
    const tag = hasLink ? 'a' : 'span';
    const hasIcon = !!s.selected_icon?.value;
    const hasContent = !isEmpty(s.title_text) || !isEmpty(s.description_text);
    if (!hasIcon && !hasContent) return '';
    const la = hasLink ? linkAttrs(s.link) : '';
    const iconAttrs = attrs({
      class: cx('elementor-icon', s.hover_animation && `elementor-animation-${s.hover_animation}`),
      tabindex: hasLink ? '-1' : undefined,
      'aria-label': hasLink && s.title_text ? s.title_text : undefined,
    });
    let html = '<div class="elementor-icon-box-wrapper">';
    if (hasIcon) html += `<div class="elementor-icon-box-icon"><${tag} ${la} ${iconAttrs}>${iconHtml(s.selected_icon)}</${tag}></div>`;
    if (hasContent) {
      html += '<div class="elementor-icon-box-content">';
      if (!isEmpty(s.title_text)) {
        const t = s.title_size || 'h3';
        html += `<${t} class="elementor-icon-box-title"><${tag} ${la}>${s.title_text}</${tag}></${t}>`;
      }
      if (!isEmpty(s.description_text)) html += `<p class="elementor-icon-box-description">${s.description_text}</p>`;
      html += '</div>';
    }
    return html + '</div>';
  },

  'image-box'(s) {
    const hasImage = !!s.image?.url;
    const hasContent = !isEmpty(s.title_text) || !isEmpty(s.description_text);
    if (!hasImage && !hasContent) return '';
    const la = s.link?.url ? linkAttrs(s.link) : '';
    let html = '<div class="elementor-image-box-wrapper">';
    if (hasImage) {
      let img = imgHtml(attachmentImage(s.image, s.thumbnail_size || 'full', s.thumbnail_custom_dimension));
      if (la) img = `<a ${la} tabindex="-1">${img}</a>`;
      html += `<figure class="elementor-image-box-img">${img}</figure>`;
    }
    if (hasContent) {
      html += '<div class="elementor-image-box-content">';
      if (!isEmpty(s.title_text)) {
        const t = s.title_size || 'h3';
        html += `<${t} class="elementor-image-box-title">${la ? `<a ${la}>${s.title_text}</a>` : s.title_text}</${t}>`;
      }
      if (!isEmpty(s.description_text)) html += `<p class="elementor-image-box-description">${s.description_text}</p>`;
      html += '</div>';
    }
    return html + '</div>';
  },

  'icon-list'(s) {
    const inline = s.view === 'inline';
    const items = (s.icon_list || []).map(item => {
      let li = '';
      const la = item.link?.url ? linkAttrs(item.link) : '';
      if (la) li += `<a ${la}>`;
      if (item.selected_icon?.value) li += `<span class="elementor-icon-list-icon">${iconHtml(item.selected_icon)}</span>`;
      li += `<span class="elementor-icon-list-text">${item.text ?? ''}</span>`;
      if (la) li += '</a>';
      return `<li class="${cx('elementor-icon-list-item', inline && 'elementor-inline-item')}">${li}</li>`;
    });
    return `<ul class="${cx('elementor-icon-list-items', inline && 'elementor-inline-items')}">${items.join('')}</ul>`;
  },

  image(s) {
    if (!s.image?.url) return '';
    let img = imgHtml(attachmentImage(s.image, s.image_size || 'large', s.image_custom_dimension));
    const la = imageLink(s, s.image);
    if (la) img = `<a ${la}>${img}</a>`;
    return img;
  },

  // Pro "Site Logo": the Image widget fed with the site's custom logo, linked to the home page.
  'theme-site-logo'(s) {
    const image = { id: 21, url: site.logo.url };
    const img = imgHtml(attachmentImage(image, s.image_size || 'full', s.image_custom_dimension), { loading: undefined });
    return `<a href="/">${img}</a>`;
  },

  button(s) {
    if (isEmpty(s.text) && !s.selected_icon?.value) return '';
    const hasLink = !!s.link?.url;
    const a = attrs({
      class: cx('elementor-button', hasLink && 'elementor-button-link', `elementor-size-${s.size || 'sm'}`, s.hover_animation && `elementor-animation-${s.hover_animation}`),
      role: hasLink ? undefined : 'button',
      id: s.button_css_id || undefined,
    });
    let inner = '<span class="elementor-button-content-wrapper">';
    if (s.selected_icon?.value) inner += `<span class="elementor-button-icon">${iconHtml(s.selected_icon)}</span>`;
    if (!isEmpty(s.text)) inner += `<span class="elementor-button-text">${s.text}</span>`;
    inner += '</span>';
    return `<a ${hasLink ? linkAttrs(s.link) + ' ' : ''}${a}>${inner}</a>`;
  },

  divider(s) {
    let el = '';
    if (s.look === 'line_icon' && s.icon?.value) el = `<div class="elementor-icon elementor-divider__element">${iconHtml(s.icon)}</div>`;
    else if (s.look === 'line_text' && s.text) {
      const t = s.html_tag || 'span';
      el = `<${t} class="elementor-divider__text elementor-divider__element">${s.text}</${t}>`;
    }
    return `<div class="elementor-divider"><span class="elementor-divider-separator">${el}</span></div>`;
  },

  icon(s) {
    if (!s.selected_icon?.value) return '';
    const tag = s.link?.url ? 'a' : 'div';
    const a = `${s.link?.url ? linkAttrs(s.link) + ' ' : ''}class="${cx('elementor-icon', s.hover_animation && `elementor-animation-${s.hover_animation}`)}"`;
    return `<div class="elementor-icon-wrapper"><${tag} ${a}>${iconHtml(s.selected_icon)}</${tag}></div>`;
  },
};

export { esc };
