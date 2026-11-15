import { useLayoutEffect } from 'react';

// Several pickers can be open in quick succession; only collapse the popup
// after the last one has closed.
let openPanels = 0;
let currentHeight = '600px';
let collapseTimer: number | null = null;

// Radix/tw-animate-css exit animation is 150ms. Collapsing earlier shows the
// popover being clipped mid-animation (the "flash" after selecting an icon).
const COLLAPSE_DELAY_MS = 100;

function updatePopupSize() {
  const { body, documentElement } = document;

  if (openPanels > 0) {
    documentElement.style.height = currentHeight;
    body.style.height = currentHeight;
    body.style.overflow = 'hidden';
    return;
  }

  documentElement.style.height = '';
  body.style.height = '';
  body.style.overflow = '';
}

function cancelScheduledCollapse() {
  if (collapseTimer === null) return;

  window.clearTimeout(collapseTimer);
  collapseTimer = null;
}

function expandPopup(height: string) {
  cancelScheduledCollapse();
  openPanels += 1;
  currentHeight = height;
  updatePopupSize();
}

function collapsePopup() {
  openPanels = Math.max(0, openPanels - 1);

  if (openPanels > 0) return;

  cancelScheduledCollapse();
  collapseTimer = window.setTimeout(() => {
    collapseTimer = null;
    if (openPanels === 0) updatePopupSize();
  }, COLLAPSE_DELAY_MS);
}

/**
 * Allows the popup to grow while a large panel (emoji picker / icon grid) is
 * open, so the panel is not clipped by the popup viewport. The popup is
 * collapsed only after the panel's exit animation has finished.
 */
export function usePopupHeight(isOpen: boolean, height: string = '600px') {
  useLayoutEffect(() => {
    if (!isOpen) return;

    expandPopup(height);
    return () => collapsePopup();
  }, [height, isOpen]);
}
