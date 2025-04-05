import { useEffect } from 'react';

/**
 * 自定义hook，用于根据状态动态调整popup高度
 * @param isOpen 控制元素的开关状态
 * @param height 当isOpen为true时设置的高度
 */
export function usePopupHeight(isOpen: boolean, height: string = '600px') {
  useEffect(() => {
    if (isOpen) {
      document.body.style.height = height; 
      document.body.style.overflow = "hidden"; // 防止出现双滚动条
    } else {
      document.body.style.height = "";
      document.body.style.overflow = "";
    }
    
    // 清理函数，确保组件卸载时恢复初始状态
    return () => {
      document.body.style.height = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, height]);
} 