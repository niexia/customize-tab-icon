import { useLayoutEffect } from 'react';

// Several pickers can be open in quick succession; only collapse the popup
// after the last one has closed.
let openPanels = 0;
let currentHeight = '600px';

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

/**
 * Allows the popup to grow while a large panel (emoji picker / icon grid) is
 * open, so the panel is not clipped by the popup viewport.
 */
export function usePopupHeight(isOpen: boolean, height: string = '600px') {
  useLayoutEffect(() => {
    if (!isOpen) return;

    openPanels += 1;
    currentHeight = height;
    updatePopupSize();

    return () => {
      openPanels = Math.max(0, openPanels - 1);
      updatePopupSize();
    };
  }, [height, isOpen]);
}
