import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function log(type: 'log'|'warn'|'error', msg: string, ...args: any[]) {
  console[type](`[Changicon] ${msg}`, ...args)
}

/**
 * 获取当前网页的图标URL
 * 会按照以下顺序尝试获取:
 * 1. 查找页面中带有icon相关属性的link标签
 * 2. 如果找不到,则返回网站根目录下的favicon.ico
 * @returns 图标的URL地址
 */
export function getWebsiteIcon(): string {
  const iconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel*="icon"]'
  ];

  for (const selector of iconSelectors) {
    const $icon = document.querySelector(selector) as HTMLLinkElement;
    if ($icon && $icon.href) {
      return $icon.href;
    }
  }

  const domain = window.location.origin;
  return `${domain}/favicon.ico`;
}

export function setWebsiteIcon(icon: string) {
  // 移除所有现有的图标
  const existingIcons = document.querySelectorAll('link[rel*="icon"]');
  existingIcons.forEach(el => el.remove());
  
  // 创建新的图标链接
  const newIcon = document.createElement('link');
  newIcon.rel = 'icon';
  newIcon.href = icon;
  document.head.appendChild(newIcon);
  
  return true;
}

interface IconConfig {
  size?: number;
  padding?: number;
}

const DEFAULT_CONFIG: IconConfig = {
  size: 32,
  padding: 4,
};

/**
 * 生成 emoji 图标的 data URL
 */
export function generateEmojiDataUrl(emoji: string, config: IconConfig = DEFAULT_CONFIG) {
  const { size = 32, padding = 4 } = config;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
  const fontSize = size - (padding * 2);
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.clearRect(0, 0, size, size);

  // 计算视觉居中的位置：中心点 + 2px的视觉偏移
  const centerY = (size / 2) + 2;
  ctx.fillText(emoji, size / 2, centerY);

  return canvas.toDataURL('image/png');
}

/**
 * 生成文本图标的 data URL
 */
export function generateTextDataUrl(text: string, config: IconConfig = DEFAULT_CONFIG) {
  const { size = 32 } = config;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  ctx.font = '16px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = '#000';
  const displayText = text.trim().slice(0, 2);
  ctx.fillText(displayText, size / 2, size / 2);

  return canvas.toDataURL('image/png');
}

/**
 * 生成 SVG 图标的 data URL
 */
export function generateSvgDataUrl(svgElement: SVGElement, config: IconConfig = DEFAULT_CONFIG) {
  const { size = 32 } = config;
  const newSvg = svgElement.cloneNode(true) as SVGElement;
  newSvg.setAttribute('width', size.toString());
  newSvg.setAttribute('height', size.toString());
  newSvg.setAttribute('stroke', 'currentColor');

  const svgString = new XMLSerializer().serializeToString(newSvg);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
}

/**
 * 调整图片大小并生成 data URL
 */
export function resizeImageToDataUrl(file: File, config: IconConfig = DEFAULT_CONFIG): Promise<string> {
  const { size = 32 } = config;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = document.createElement('img');
      imgElement.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(imgElement, 0, 0, size, size);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(e.target?.result as string);
        }
      };
      imgElement.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
} 