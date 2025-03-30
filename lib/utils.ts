import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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