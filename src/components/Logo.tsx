interface LogoProps {
  fillColor?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

// Соотношение сторон viewBox: ширина / высота
const ASPECT_RATIO = 548.47 / 446.66; // ≈ 1.228

const Logo = ({
  fillColor = '#000000',
  className = '',
  width,
  height = 200
}: LogoProps) => {
  // Вычисляем размеры на основе соотношения сторон
  let finalWidth: number | string;
  let finalHeight: number | string;

  if (width !== undefined && height !== undefined) {
    // Если переданы оба параметра, используем как есть
    finalWidth = width;
    finalHeight = height;
  } else if (width !== undefined) {
    // Если передан только width, вычисляем height
    const widthNum = typeof width === 'string' ? parseFloat(width) : width;
    finalWidth = width;
    finalHeight = widthNum / ASPECT_RATIO;
  } else {
    // Если передан только height (или ничего), вычисляем width
    const heightNum = typeof height === 'string' ? parseFloat(height) : height;
    finalWidth = heightNum * ASPECT_RATIO;
    finalHeight = height;
  }

  const widthValue = typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth;
  const heightValue = typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight;

  return (
    <div
      className={className}
      style={{
        width: widthValue,
        height: heightValue,
        maxWidth: widthValue,
        maxHeight: heightValue,
        minWidth: widthValue,
        minHeight: heightValue,
        display: 'inline-block',
        flexShrink: 0,
        lineHeight: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 548.47 446.66"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <path
          className="st0"
          d="M258.41,231.86l-17.14,31.19v114.08c0,15.04,1.36,29.44,4.09,36.96,2.73,7.52,8.06,12.53,16.02,15.04,7.95,2.51,18.52,4.72,28.98,5.01v12.53h-161.56v-12.53c10.74-.37,21.03-2.5,28.98-5.01,7.95-2.5,13.29-7.52,16.02-15.04,2.73-7.52,4.09-21.92,4.09-36.96v-94.11L39.53,48.24c-9.09-15.45-16.7-25.16-22.83-29.13C10.56,15.14,5,12.53,0,12.53V0l135.1.36v12.17c-3.4.57-22.36,2.86-26.73,18.16-1.98,6.94-.68,16.08,6.13,28.19l113.45,199.92,23.92-43.81-62.99-162.38c-6.26-15.87-13.36-26.41-21.3-31.63-7.94-5.22-15.24-8.04-21.93-8.46V0l135.1.17v12.37c-8.37.82-15.47,2.63-20.14,5.01-7.02,3.57-11.28,8.04-11.9,15.35-.63,7.31,1.77,18.07,7.2,32.26l31.78,84.24,27.19-49.79c12.72-22.97,18.97-40.72,18.74-53.25s-6.08-20.2-16.02-26c-6.06-3.54-14.4-6.53-24.03-7.83V.21l109.22-.21v12.53c-8.63,1.67-17.26,6.79-25.9,15.35-8.63,8.56-18.17,22.03-28.62,40.4l-54.06,98.4,75.28,199.54,101.91-264.73c8.78-22.55,12.95-40.2,12.53-52.94-.42-12.74-5.22-21.82-14.41-27.25-7.39-4.37-17.49-7.65-30.29-8.77V.15l109.23-.15v12.53c-7.94,1.67-16.39,6.47-25.37,14.41-8.98,7.94-17.01,21.3-24.12,40.09l-147.22,379.63h-10.02l-83.33-214.81Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};

export default Logo;

