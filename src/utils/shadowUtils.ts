// Утилита для генерации тени на основе цвета
import type React from 'react';

/**
 * Преобразует HEX цвет в RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Генерирует цвет тени на основе цвета фона
 */
export function generateShadowColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return 'rgba(0, 0, 0, 0.15)';

  // Вычисляем яркость цвета
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

  // Маппинг цветов для специальных случаев
  const colorMap: { [key: string]: string } = {
    '#384a32': 'rgba(56, 74, 50, 0.3)', // темно-оливковый
    '#f4f7f0': 'rgba(56, 74, 50, 0.15)', // светло-кремовый
    '#9fb1c2': 'rgba(159, 177, 194, 0.25)', // светло-голубой
    '#59151f': 'rgba(89, 21, 31, 0.35)', // темно-бордовый
    '#e0cdba': 'rgba(56, 74, 50, 0.2)', // светло-бежевый
    '#616161': 'rgba(97, 97, 97, 0.3)', // темно-серый
  };

  // Если цвет есть в маппинге, используем его
  if (colorMap[backgroundColor.toLowerCase()]) {
    return colorMap[backgroundColor.toLowerCase()];
  }

  // Для светлых цветов используем более темную тень
  // Для темных цветов используем более светлую тень
  if (brightness > 200) {
    // Светлый цвет - темная тень с оттенком цвета
    const shadowR = Math.max(0, Math.min(255, rgb.r - 60));
    const shadowG = Math.max(0, Math.min(255, rgb.g - 60));
    const shadowB = Math.max(0, Math.min(255, rgb.b - 60));
    return `rgba(${shadowR}, ${shadowG}, ${shadowB}, 0.25)`;
  } else if (brightness > 100) {
    // Средний цвет - средняя тень
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
  } else {
    // Темный цвет - светлая тень
    const shadowR = Math.max(0, Math.min(255, rgb.r + 40));
    const shadowG = Math.max(0, Math.min(255, rgb.g + 40));
    const shadowB = Math.max(0, Math.min(255, rgb.b + 40));
    return `rgba(${shadowR}, ${shadowG}, ${shadowB}, 0.3)`;
  }
}

/**
 * Генерирует стиль тени для шапки на основе цвета фона секции
 */
export function generateHeaderShadow(backgroundColor: string): React.CSSProperties {
  const shadowColor = generateShadowColor(backgroundColor);
  return {
    boxShadow: `0 4px 20px -2px ${shadowColor}, 0 2px 8px -2px ${shadowColor}, 0 1px 4px -1px ${shadowColor}`,
    transition: 'box-shadow 0.3s ease',
  };
}

