export type IconBackground = 'white' | 'transparent';

export interface IconConfig {
  size?: number;
  padding?: number;
  background?: IconBackground;
}

const DEFAULT_SIZE = 128;
const DEFAULT_PADDING = 16;
const SVG_NS = 'http://www.w3.org/2000/svg';
const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", system-ui, sans-serif';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const TRANSPARENT_FILL_RATIO = 0.94;

function createCanvas(size: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  return ctx ? { canvas, ctx } : null;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawRoundedBackground(ctx: CanvasRenderingContext2D, size: number): void {
  roundedRectPath(ctx, 0, 0, size, size, size / 4);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

function textMetricsY(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerY: number,
  fontSize: number,
): number {
  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
  return centerY + (ascent - descent) / 2;
}

/**
 * Draw text/emoji using its actual ink bounds, so transparent icons fill the
 * canvas instead of carrying the padding that is only needed on a white tile.
 */
function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  font: string,
  fillRatio: number,
): void {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const metrics = ctx.measureText(text);
  const left = metrics.actualBoundingBoxLeft || 0;
  const right = metrics.actualBoundingBoxRight || metrics.width || 0;
  const ascent = metrics.actualBoundingBoxAscent || 0;
  const descent = metrics.actualBoundingBoxDescent || 0;
  const inkWidth = left + right;
  const inkHeight = ascent + descent;

  if (inkWidth <= 0 || inkHeight <= 0) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);
    ctx.restore();
    return;
  }

  const scale = Math.min(
    (size * fillRatio) / inkWidth,
    (size * fillRatio) / inkHeight,
  );
  const inkCenterX = (right - left) / 2;
  const inkCenterY = (descent - ascent) / 2;

  ctx.translate(size / 2, size / 2);
  ctx.scale(scale, scale);
  ctx.translate(-inkCenterX, -inkCenterY);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/**
 * Generate a rounded white tile with up to two characters.
 * The font size is auto-fitted so short text fills the icon.
 */
export function generateTextDataUrl(text: string, config: IconConfig = {}): string {
  const size = config.size ?? DEFAULT_SIZE;
  const padding = config.padding ?? DEFAULT_PADDING;
  const displayText = Array.from(text.trim()).slice(0, 2).join('');

  if (!displayText) return '';

  const created = createCanvas(size);
  if (!created) return '';

  const { canvas, ctx } = created;
  const available = size - padding * 2;

  ctx.clearRect(0, 0, size, size);
  const background = config.background ?? 'white';

  if (background === 'white') {
    drawRoundedBackground(ctx, size);
  }

  ctx.fillStyle = '#000';

  if (background === 'transparent') {
    drawFittedText(
      ctx,
      displayText,
      size,
      `600 ${size}px ${EMOJI_FONT}`,
      TRANSPARENT_FILL_RATIO,
    );
    return canvas.toDataURL('image/png');
  }

  let fontSize = Math.max(6, Math.floor(available));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Shrink until the text fits both the width and the content box height.
  while (fontSize > 6) {
    ctx.font = `600 ${fontSize}px ${EMOJI_FONT}`;
    const metrics = ctx.measureText(displayText);
    const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    if (metrics.width <= available && textHeight <= available) break;
    fontSize -= 1;
  }

  ctx.font = `600 ${fontSize}px ${EMOJI_FONT}`;
  ctx.fillText(displayText, size / 2, textMetricsY(ctx, displayText, size / 2, fontSize));

  return canvas.toDataURL('image/png');
}

/**
 * Generate a rounded white tile with a single emoji.
 */
export function generateEmojiDataUrl(emoji: string, config: IconConfig = {}): string {
  const size = config.size ?? DEFAULT_SIZE;
  const padding = config.padding ?? DEFAULT_PADDING;
  const value = emoji.trim();

  if (!value) return '';

  const created = createCanvas(size);
  if (!created) return '';

  const { canvas, ctx } = created;
  const available = size - padding * 2;

  ctx.clearRect(0, 0, size, size);
  const background = config.background ?? 'white';

  if (background === 'white') {
    drawRoundedBackground(ctx, size);
  }

  ctx.fillStyle = '#000';

  if (background === 'transparent') {
    drawFittedText(ctx, value, size, `${size}px ${EMOJI_FONT}`, TRANSPARENT_FILL_RATIO);
    return canvas.toDataURL('image/png');
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  let fontSize = Math.max(6, Math.floor(available));
  while (fontSize > 6) {
    ctx.font = `${fontSize}px ${EMOJI_FONT}`;
    if (ctx.measureText(value).width <= available) break;
    fontSize -= 1;
  }

  ctx.font = `${fontSize}px ${EMOJI_FONT}`;
  ctx.fillText(value, size / 2, textMetricsY(ctx, value, size / 2, fontSize));

  return canvas.toDataURL('image/png');
}

/**
 * Generate an SVG data URL for a lucide icon, with a rounded white background
 * and padding around the glyph.
 */
export function generateSvgDataUrl(svgElement: SVGElement, config: IconConfig = {}): string {
  const size = config.size ?? DEFAULT_SIZE;
  const padding = config.padding ?? DEFAULT_PADDING;
  const newSvg = svgElement.cloneNode(true) as SVGElement;

  const viewBox = (newSvg.getAttribute('viewBox') ?? '0 0 24 24')
    .split(/[\s,]+/)
    .map(Number);

  let minX = viewBox[0] ?? 0;
  let minY = viewBox[1] ?? 0;
  let viewWidth = viewBox[2] ?? 24;
  let viewHeight = viewBox[3] ?? 24;

  if (![minX, minY, viewWidth, viewHeight].every(Number.isFinite) || !viewWidth || !viewHeight) {
    minX = 0;
    minY = 0;
    viewWidth = 24;
    viewHeight = 24;
  }

  const background = config.background ?? 'white';
  const effectivePadding = background === 'transparent' ? size * 0.03 : padding;
  const insetX = (viewWidth * effectivePadding) / size;
  const insetY = (viewHeight * effectivePadding) / size;
  const totalWidth = viewWidth + insetX * 2;
  const totalHeight = viewHeight + insetY * 2;

  newSvg.setAttribute('viewBox', `${minX - insetX} ${minY - insetY} ${totalWidth} ${totalHeight}`);
  newSvg.setAttribute('width', String(size));
  newSvg.setAttribute('height', String(size));
  newSvg.removeAttribute('class');

  if (!newSvg.getAttribute('xmlns')) {
    newSvg.setAttribute('xmlns', SVG_NS);
  }

  if (background === 'white') {
    const background = document.createElementNS(SVG_NS, 'rect');
    background.setAttribute('x', String(minX - insetX));
    background.setAttribute('y', String(minY - insetY));
    background.setAttribute('width', String(totalWidth));
    background.setAttribute('height', String(totalHeight));
    background.setAttribute('rx', String(totalWidth / 4));
    background.setAttribute('fill', '#fff');
    background.setAttribute('stroke', 'none');
    newSvg.insertBefore(background, newSvg.firstChild);
  }

  const svgString = new XMLSerializer().serializeToString(newSvg);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

export type ImageFit = 'cover' | 'contain';

/**
 * Turn an uploaded image into a rounded icon.
 *
 * - `cover` (default): scale to fill the icon and crop the overflow, so no
 *   white bars are visible.
 * - `contain`: show the whole image, letterboxed on a white tile.
 *
 * Rejects (instead of hanging) when the file cannot be read.
 */
export function resizeImageToDataUrl(
  file: File,
  config: IconConfig = {},
  fit: ImageFit = 'cover',
): Promise<string> {
  const size = config.size ?? DEFAULT_SIZE;
  const background = config.background ?? 'white';
  const containPadding = config.padding ?? DEFAULT_PADDING;
  const padding =
    fit === 'contain'
      ? background === 'transparent'
        ? size * 0.03
        : containPadding
      : 0;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      reject(new Error('This image is larger than 5 MB.'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const created = createCanvas(size);
        if (!created) throw new Error('Canvas is not supported in this browser.');

        const { canvas, ctx } = created;
        const available = size - padding * 2;

        if (!image.width || !image.height) {
          throw new Error('Could not read this image.');
        }

        ctx.clearRect(0, 0, size, size);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (background === 'white') {
          drawRoundedBackground(ctx, size);
        }

        // cover: fill the icon and crop; contain: show the full image.
        const scale =
          fit === 'cover'
            ? Math.max(size / image.width, size / image.height)
            : Math.min(available / image.width, available / image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        const x = (size - drawWidth) / 2;
        const y = (size - drawHeight) / 2;

        ctx.save();
        roundedRectPath(ctx, 0, 0, size, size, size / 4);
        ctx.clip();
        ctx.drawImage(image, x, y, drawWidth, drawHeight);
        ctx.restore();

        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this image.'));
    };

    image.src = objectUrl;
  });
}
