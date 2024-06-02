import { useEffect } from "react";

/**
 * 使用paste事件监听来允许用户通过粘贴来上传文件。
 * 
 * 该hook旨在增强用户体验，允许用户通过复制粘贴的方式来上传文件，而不仅仅是通过文件选择对话框。
 * 它通过监听document.body的paste事件来实现文件的获取和上传回调的触发。
 * 
 * @param {Object} config - 配置对象
 * @param {Function} config.onFilesPaste - 当文件被粘贴时调用的回调函数。接收一个File数组作为参数。
 */
export function usePasteFile({
    onFilesPaste,
  }: {
    onFilesPaste: (files: File[]) => void;
  }) {
    useEffect(() => {
      /**
       * 处理paste事件的函数。
       * 
       * 该函数从事件的clipboardData中提取文件，并调用onFilesPaste回调函数传入这些文件。
       * 它首先检查是否有clipboardData，然后遍历items，将每个item转换为File对象并添加到files数组中。
       * 如果files数组不为空，则调用onFilesPaste回调函数。
       * 
       * @param {ClipboardEvent} e - paste事件对象
       */
      const pasteHandler = (e: ClipboardEvent) => {
        const files: File[] = [];
        if (!e.clipboardData) return;
  
        Array.from(e.clipboardData.items).forEach((item) => {
          const f = item.getAsFile();
          if (f) {
            files.push(f);
          }
        });
  
        if (files.length > 0) {
          onFilesPaste(files);
        }
      };
  
      // 在document.body上添加paste事件监听器
      document.body.addEventListener("paste", pasteHandler);
      // 返回一个函数，在组件卸载时移除paste事件监听器
      return () => {
        document.body.removeEventListener("paste", pasteHandler);
      };
    }, [onFilesPaste]);
  }