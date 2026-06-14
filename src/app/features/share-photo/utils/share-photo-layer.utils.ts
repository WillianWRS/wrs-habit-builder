/** Inter substitui Boathouse (fonte proprietária dos overlays do Strava). */
export const SHARE_PHOTO_LAYER_FONT = '"Inter", ui-sans-serif, system-ui, sans-serif';
const DIA_LABEL = 'DIA';

export type SharePhotoLayoutPosition =
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right';

export type SharePhotoLabelLayout = 'stacked' | 'inline';

export interface SharePhotoLayerHabit {
  name: string;
  displayMeta: string;
  dayCount: number;
}

export interface SharePhotoLayerRenderOptions {
  gradientShading?: boolean;
  showMeta?: boolean;
  labelLayout?: SharePhotoLabelLayout;
  jpegQuality?: number;
  maxWidth?: number;
}

export const SHARE_PHOTO_LAYOUT_OPTIONS: readonly {
  id: SharePhotoLayoutPosition;
  label: string;
}[] = [
  { id: 'bottom-left', label: 'Inferior esquerdo' },
  { id: 'bottom-right', label: 'Inferior direito' },
  { id: 'top-left', label: 'Superior esquerdo' },
  { id: 'top-right', label: 'Superior direito' },
];

export const SHARE_PHOTO_INLINE_POSITION_OPTIONS: readonly {
  id: SharePhotoLayoutPosition;
  label: string;
}[] = [
  { id: 'bottom-left', label: 'Inferior' },
  { id: 'top-left', label: 'Superior' },
];

export function toLeftEquivalentPosition(
  position: SharePhotoLayoutPosition,
): SharePhotoLayoutPosition {
  return position.endsWith('right')
    ? (`${position.startsWith('bottom') ? 'bottom' : 'top'}-left` as SharePhotoLayoutPosition)
    : position;
}

export function resolveEffectiveLayoutPosition(
  position: SharePhotoLayoutPosition,
  labelLayout: SharePhotoLabelLayout,
): SharePhotoLayoutPosition {
  if (labelLayout === 'inline') {
    return position.startsWith('bottom') ? 'bottom-left' : 'top-left';
  }

  return position;
}

export const SHARE_PHOTO_LABEL_LAYOUT_OPTIONS: readonly {
  id: SharePhotoLabelLayout;
  label: string;
  premium?: boolean;
}[] = [
  { id: 'stacked', label: 'Empilhado' },
  { id: 'inline', label: 'Linha única', premium: true },
];

const DEFAULT_JPEG_QUALITY = 0.92;
const DESKTOP_PREVIEW_JPEG_QUALITY = 0.98;
const INLINE_FONT_SCALE = 0.6;

interface LayerMetrics {
  paddingX: number;
  paddingY: number;
  blockPaddingX: number;
  normalFontSize: number;
  smallFontSize: number;
  smallGap: number;
  lineGap: number;
  diaLetterSpacing: number;
  logoBorderWidth: number;
  logoCornerRadius: number;
  logoHeight: number;
  isRight: boolean;
  isBottom: boolean;
}

export async function ensureSharePhotoLayerFontsLoaded(): Promise<void> {
  if (!document.fonts) {
    return;
  }

  await Promise.all([
    document.fonts.load(`400 13px ${SHARE_PHOTO_LAYER_FONT}`),
    document.fonts.load(`500 13px ${SHARE_PHOTO_LAYER_FONT}`),
    document.fonts.load(`500 26px ${SHARE_PHOTO_LAYER_FONT}`),
    document.fonts.load(`600 26px ${SHARE_PHOTO_LAYER_FONT}`),
    document.fonts.load(`700 26px ${SHARE_PHOTO_LAYER_FONT}`),
  ]);
}

export function resolveSharePhotoPreviewOptions(
  isDesktop: boolean,
  gradientShading: boolean,
  showMeta: boolean,
  labelLayout: SharePhotoLabelLayout,
): SharePhotoLayerRenderOptions {
  return {
    gradientShading,
    showMeta,
    labelLayout,
    jpegQuality: isDesktop ? DESKTOP_PREVIEW_JPEG_QUALITY : DEFAULT_JPEG_QUALITY,
    maxWidth: isDesktop ? undefined : 1600,
  };
}

export function renderSharePhotoLayer(
  sourceImage: HTMLImageElement,
  habit: SharePhotoLayerHabit,
  logo: HTMLImageElement | null,
  position: SharePhotoLayoutPosition,
  options: SharePhotoLayerRenderOptions = {},
): string {
  const gradientShading = options.gradientShading ?? true;
  const showMeta = options.showMeta ?? true;
  const labelLayout = options.labelLayout ?? 'stacked';
  const jpegQuality = options.jpegQuality ?? DEFAULT_JPEG_QUALITY;
  const effectivePosition = resolveEffectiveLayoutPosition(position, labelLayout);
  const scale =
    options.maxWidth && sourceImage.naturalWidth > options.maxWidth
      ? options.maxWidth / sourceImage.naturalWidth
      : 1;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sourceImage.naturalWidth * scale);
  canvas.height = Math.round(sourceImage.naturalHeight * scale);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

  if (gradientShading) {
    drawOverlayGradient(ctx, canvas.width, canvas.height, effectivePosition);
  }

  drawLayerBlock(
    ctx,
    canvas.width,
    canvas.height,
    habit,
    logo,
    effectivePosition,
    showMeta,
    labelLayout,
  );

  return canvas.toDataURL('image/jpeg', jpegQuality);
}

function resolveLayerMetrics(
  canvasWidth: number,
  canvasHeight: number,
  position: SharePhotoLayoutPosition,
): LayerMetrics {
  const paddingX = Math.max(16, Math.round(canvasWidth * 0.032));
  const paddingY = Math.max(14, Math.round(canvasHeight * 0.025));
  const normalFontSize = Math.max(26, Math.round(canvasWidth * 0.046));
  const smallFontSize = Math.max(13, Math.round(normalFontSize * 0.5));
  const isRight = position.endsWith('right');

  return {
    paddingX,
    paddingY,
    blockPaddingX: Math.max(8, Math.round(normalFontSize * 0.25)),
    normalFontSize,
    smallFontSize,
    smallGap: Math.max(10, Math.round(normalFontSize * 0.35)),
    lineGap: Math.max(8, Math.round(normalFontSize * 0.25)),
    diaLetterSpacing: Math.max(1, Math.round(smallFontSize * 0.14)),
    logoBorderWidth: Math.max(2, Math.round(canvasWidth * 0.002)),
    logoCornerRadius: Math.max(10, Math.round(canvasWidth * 0.014)),
    logoHeight: Math.max(29, Math.round(canvasHeight * 0.0392)),
    isRight,
    isBottom: position.startsWith('bottom'),
  };
}

function drawOverlayGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  position: SharePhotoLayoutPosition,
): void {
  const isBottom = position.startsWith('bottom');
  const isRight = position.endsWith('right');
  const cornerX = isRight ? width : 0;
  const cornerY = isBottom ? height : 0;
  const radius = Math.hypot(width, height) * 0.88;

  const gradient = ctx.createRadialGradient(cornerX, cornerY, 0, cornerX, cornerY, radius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  gradient.addColorStop(0.28, 'rgba(0, 0, 0, 0.44)');
  gradient.addColorStop(0.52, 'rgba(0, 0, 0, 0.22)');
  gradient.addColorStop(0.74, 'rgba(0, 0, 0, 0.08)');
  gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0.02)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawLayerBlock(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  habit: SharePhotoLayerHabit,
  logo: HTMLImageElement | null,
  position: SharePhotoLayoutPosition,
  showMeta: boolean,
  labelLayout: SharePhotoLabelLayout,
): void {
  if (labelLayout === 'inline') {
    drawInlineLayerBlock(ctx, canvasWidth, canvasHeight, habit, logo, position, showMeta);
    return;
  }

  drawStackedLayerBlock(ctx, canvasWidth, canvasHeight, habit, logo, position, showMeta);
}

function drawStackedLayerBlock(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  habit: SharePhotoLayerHabit,
  logo: HTMLImageElement | null,
  position: SharePhotoLayoutPosition,
  showMeta: boolean,
): void {
  const metrics = resolveLayerMetrics(canvasWidth, canvasHeight, position);
  const meta = habit.displayMeta.trim();
  const hasMeta = showMeta && meta.length > 0;

  const diaFont = `500 ${metrics.smallFontSize}px ${SHARE_PHOTO_LAYER_FONT}`;
  const streakFont = `700 ${metrics.normalFontSize}px ${SHARE_PHOTO_LAYER_FONT}`;
  const nameFontSize = metrics.smallFontSize;
  const nameFont = `600 ${nameFontSize}px ${SHARE_PHOTO_LAYER_FONT}`;
  const metaFont = `500 ${metrics.normalFontSize}px ${SHARE_PHOTO_LAYER_FONT}`;

  const logoWidth = logo
    ? metrics.logoHeight * (logo.naturalWidth / logo.naturalHeight)
    : 0;
  const logoBoxWidth = logoWidth + metrics.logoBorderWidth * 2;
  const logoBoxHeight = metrics.logoHeight + metrics.logoBorderWidth * 2;

  const contentWidths = [
    measureTextWidth(ctx, DIA_LABEL, diaFont, metrics.diaLetterSpacing),
    measureTextWidth(ctx, String(habit.dayCount), streakFont),
    measureTextWidth(ctx, habit.name, nameFont),
    hasMeta ? measureTextWidth(ctx, meta, metaFont) : 0,
    logo ? logoBoxWidth : 0,
  ];
  const blockWidth = Math.max(...contentWidths) + metrics.blockPaddingX * 2;
  const blockLeft = metrics.isRight
    ? canvasWidth - metrics.paddingX - blockWidth
    : metrics.paddingX;
  const centerX = blockLeft + blockWidth / 2;

  ctx.textAlign = 'center';

  const blockParams: LayerBlockDrawParams = {
    metrics,
    diaFont,
    streakFont,
    nameFont,
    metaFont,
    nameFontSize,
    habit,
    meta,
    hasMeta,
    logo,
    logoBoxWidth,
    logoBoxHeight,
    logoWidth,
  };

  if (metrics.isBottom) {
    drawBottomAnchoredBlock(
      ctx,
      centerX,
      canvasHeight - metrics.paddingY,
      blockParams,
    );
    return;
  }

  drawTopAnchoredBlock(ctx, centerX, metrics.paddingY, blockParams);
}

function drawInlineLayerBlock(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  habit: SharePhotoLayerHabit,
  logo: HTMLImageElement | null,
  position: SharePhotoLayoutPosition,
  showMeta: boolean,
): void {
  const metrics = resolveLayerMetrics(canvasWidth, canvasHeight, position);
  const meta = habit.displayMeta.trim();
  const hasMeta = showMeta && meta.length > 0;
  const typography = resolveInlineTypography(metrics);
  const separator = ' · ';
  const daySegment = `Dia ${habit.dayCount}`;

  const logoWidth = logo
    ? typography.logoHeight * (logo.naturalWidth / logo.naturalHeight)
    : 0;
  const separatorWidth = measureTextWidth(ctx, separator, typography.separatorFont);
  const nameWidth = measureTextWidth(ctx, habit.name, typography.segmentFont);
  const metaWidth = hasMeta ? measureTextWidth(ctx, meta, typography.segmentFont) : 0;

  const contentHeight = Math.max(typography.fontSize, typography.logoHeight);
  const anchorY = metrics.isBottom
    ? canvasHeight - metrics.paddingY - contentHeight / 2
    : metrics.paddingY + contentHeight / 2;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  let x = metrics.paddingX;

  if (logo) {
    const logoY = anchorY - typography.logoHeight / 2;
    drawInlineLogo(
      ctx,
      logo,
      x,
      logoY,
      logoWidth,
      typography.logoHeight,
      typography.logoCornerRadius,
    );
    x += logoWidth + typography.logoGap;
  }

  ctx.font = typography.segmentFont;
  drawLayerText(ctx, habit.name, x, anchorY);
  x += nameWidth;

  if (hasMeta) {
    ctx.font = typography.separatorFont;
    drawLayerText(ctx, separator, x, anchorY, 0, 0.5);
    x += separatorWidth;

    ctx.font = typography.segmentFont;
    drawLayerText(ctx, meta, x, anchorY);
    x += metaWidth;
  }

  ctx.font = typography.separatorFont;
  drawLayerText(ctx, separator, x, anchorY, 0, 0.5);
  x += separatorWidth;

  ctx.font = typography.segmentFont;
  drawLayerText(ctx, daySegment, x, anchorY);
}

function resolveInlineTypography(metrics: LayerMetrics): {
  fontSize: number;
  logoHeight: number;
  logoGap: number;
  segmentFont: string;
  separatorFont: string;
  logoCornerRadius: number;
} {
  const fontSize = Math.max(10, Math.round(metrics.normalFontSize * INLINE_FONT_SCALE));

  return {
    fontSize,
    logoHeight: Math.max(12, Math.round(fontSize * 1.08)),
    logoGap: Math.max(6, Math.round(fontSize * 0.45)),
    segmentFont: `600 ${fontSize}px ${SHARE_PHOTO_LAYER_FONT}`,
    separatorFont: `400 ${fontSize}px ${SHARE_PHOTO_LAYER_FONT}`,
    logoCornerRadius: Math.max(4, Math.round(fontSize * 0.22)),
  };
}

function drawInlineLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  cornerRadius: number,
): void {
  ctx.save();
  fillRoundedRect(ctx, x, y, width, height, cornerRadius);
  ctx.clip();
  ctx.drawImage(logo, x, y, width, height);
  ctx.restore();
}

interface LayerBlockDrawParams {
  metrics: LayerMetrics;
  diaFont: string;
  streakFont: string;
  nameFont: string;
  metaFont: string;
  nameFontSize: number;
  habit: SharePhotoLayerHabit;
  meta: string;
  hasMeta: boolean;
  logo: HTMLImageElement | null;
  logoBoxWidth: number;
  logoBoxHeight: number;
  logoWidth: number;
}

function drawBottomAnchoredBlock(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  startY: number,
  params: LayerBlockDrawParams,
): void {
  const { metrics } = params;
  ctx.textBaseline = 'bottom';
  let y = startY;

  if (params.logo) {
    const boxX = centerX - params.logoBoxWidth / 2;
    const boxTop = y - params.logoBoxHeight;
    drawLogoFrame(
      ctx,
      params.logo,
      boxX,
      boxTop,
      params.logoWidth,
      params.metrics.logoHeight,
      params.logoBoxWidth,
      params.logoBoxHeight,
      metrics.logoBorderWidth,
      metrics.logoCornerRadius,
    );
    y = boxTop - metrics.smallGap;
  }

  if (params.hasMeta) {
    ctx.font = params.metaFont;
    drawLayerText(ctx, params.meta, centerX, y);
    y -= metrics.normalFontSize + metrics.lineGap;
  }

  ctx.font = params.nameFont;
  drawLayerText(ctx, params.habit.name, centerX, y);
  y -= params.nameFontSize + metrics.smallGap;

  ctx.font = params.streakFont;
  drawLayerText(ctx, String(params.habit.dayCount), centerX, y);
  y -= metrics.normalFontSize + metrics.lineGap;

  ctx.font = params.diaFont;
  drawLayerText(ctx, DIA_LABEL, centerX, y, metrics.diaLetterSpacing);
}

function drawTopAnchoredBlock(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  startY: number,
  params: LayerBlockDrawParams,
): void {
  const { metrics } = params;
  ctx.textBaseline = 'top';
  let y = startY;

  if (params.logo) {
    const boxX = centerX - params.logoBoxWidth / 2;
    drawLogoFrame(
      ctx,
      params.logo,
      boxX,
      y,
      params.logoWidth,
      params.metrics.logoHeight,
      params.logoBoxWidth,
      params.logoBoxHeight,
      metrics.logoBorderWidth,
      metrics.logoCornerRadius,
    );
    y += params.logoBoxHeight + metrics.smallGap;
  }

  ctx.font = params.nameFont;
  drawLayerText(ctx, params.habit.name, centerX, y);
  y += params.nameFontSize + (params.hasMeta ? metrics.lineGap : metrics.smallGap);

  if (params.hasMeta) {
    ctx.font = params.metaFont;
    drawLayerText(ctx, params.meta, centerX, y);
    y += metrics.normalFontSize + metrics.smallGap;
  }

  ctx.font = params.diaFont;
  drawLayerText(ctx, DIA_LABEL, centerX, y, metrics.diaLetterSpacing);
  y += metrics.smallFontSize + metrics.lineGap;

  ctx.font = params.streakFont;
  drawLayerText(ctx, String(params.habit.dayCount), centerX, y);
}

function drawLayerText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing = 0,
  fillAlpha = 1,
): void {
  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${fillAlpha})`;

  if (letterSpacing > 0) {
    ctx.letterSpacing = `${letterSpacing}px`;
  }

  const fontSize = parseFloat(ctx.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? '16');
  const blur = Math.max(4, Math.round(fontSize * 0.18));
  const offset = Math.max(1, Math.round(fontSize * 0.05));
  ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = offset;

  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawLogoFrame(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  boxX: number,
  boxTop: number,
  logoWidth: number,
  logoHeight: number,
  logoBoxWidth: number,
  logoBoxHeight: number,
  logoBorderWidth: number,
  logoCornerRadius: number,
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
  fillRoundedRect(ctx, boxX, boxTop, logoBoxWidth, logoBoxHeight, logoCornerRadius);

  ctx.save();
  fillRoundedRect(
    ctx,
    boxX + logoBorderWidth,
    boxTop + logoBorderWidth,
    logoWidth,
    logoHeight,
    Math.max(0, logoCornerRadius - logoBorderWidth),
  );
  ctx.clip();
  ctx.drawImage(
    logo,
    boxX + logoBorderWidth,
    boxTop + logoBorderWidth,
    logoWidth,
    logoHeight,
  );
  ctx.restore();
}

function measureTextWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  letterSpacing = 0,
): number {
  ctx.font = font;
  if (letterSpacing > 0) {
    ctx.letterSpacing = `${letterSpacing}px`;
  }
  const width = ctx.measureText(text).width;
  ctx.letterSpacing = '0px';
  return width;
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
