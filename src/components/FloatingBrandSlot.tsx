import logo from '@/public/images/logo.png';

export function FloatingBrandSlot() {
  return (
    <div className="fixed bottom-3 right-2 sm:bottom-5 sm:right-5 z-50 pointer-events-none">
      <div className="pointer-events-auto flex h-full w-[280px] sm:w-[320px] max-w-[90vw] items-center justify-center rounded-[16px] border border-white/70 bg-white/95 shadow-xl backdrop-blur-sm aspect-[3727/592]">
        <img
          src={logo}
          alt="Logo SMA Katolik St. Louis 1"
          loading="lazy"
          decoding="async"
          width={3727}
          height={592}
          className="h-full w-full object-contain p-1.5"
        />
      </div>
    </div>
  );
}
