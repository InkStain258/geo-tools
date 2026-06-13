import html2canvas from 'html2canvas';

/**
 * 导出指定 DOM 元素为 PNG 图片
 * @param element - 要截图的 DOM 元素
 * @param filename - 导出文件名
 * @param scale - 缩放倍率，默认 2x
 */
export async function exportToPNG(
  element: HTMLElement,
  filename: string = 'geo-tools-export',
  scale: number = 2,
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: '#FFFFFF',
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('导出PNG失败:', error);
    throw error;
  }
}
