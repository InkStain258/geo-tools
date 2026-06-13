/**
 * Canvas 工具函数
 * 处理 CSS 缩放下的坐标映射
 */

/**
 * 从鼠标事件获取正确的 Canvas 坐标（处理 CSS 缩放）
 */
export function getCanvasCoords(
  canvas: HTMLCanvasElement,
  e: { clientX: number; clientY: number }
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}
