// @ts-expect-error - handled by vite-imagetools at build time
import logoSrc from '../public/images/logolomba.webp?imagetools&w=320&format=webp&quality=75';
// @ts-expect-error - handled by vite-imagetools at build time
import logoSrcSet from '../public/images/logolomba.webp?imagetools&w=180;240;320&format=webp&quality=75&as=srcset';
// @ts-expect-error - handled by vite-imagetools at build time
import logoMeta from '../public/images/logolomba.webp?imagetools&w=320&as=metadata';

export function FloatingBrandSlot() {
  const imageWidth = logoMeta.width ?? 320;
  const imageHeight = logoMeta.height ?? 51;
  const aspectRatio = `${imageWidth}/${imageHeight}`;

  return (
    <div className="fixed bottom-3 right-2 sm:bottom-5 sm:right-5 z-50 pointer-events-none">
      <div
        className="pointer-events-auto flex h-full w-[240px] sm:w-[280px] max-w-[85vw] items-center justify-center rounded-[16px] border border-white/70 bg-white/95 shadow-xl backdrop-blur-sm"
        style={{ aspectRatio }}
      >
        <img
          src={logoSrc}
          srcSet={logoSrcSet}
          alt="Logo SMA Katolik St. Louis 1"
          loading="lazy"
          decoding="async"
          width={imageWidth}
          height={imageHeight}
          sizes="(min-width: 640px) 260px, 70vw"
          className="h-full w-full object-contain p-1.5"
        />
      </div>
    </div>
  );
}
