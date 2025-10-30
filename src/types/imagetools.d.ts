declare module '*?as=src' {
  const src: string;
  export default src;
}

declare module '*?as=srcset' {
  const srcset: string;
  export default srcset;
}

declare module '*?as=metadata' {
  const metadata: {
    src: string;
    width: number;
    height: number;
    format: string;
  };
  export default metadata;
}

declare module '*?*as=src' {
  const src: string;
  export default src;
}

declare module '*?*as=srcset' {
  const srcset: string;
  export default srcset;
}

  const metadata: {
    src: string;
    width: number;
    height: number;
    format: string;
  };
  export default metadata;
}

declare module '*?*imagetools' {
  const src: string;
  export default src;
}

declare module '*?*' {
  const value: any;
  export default value;
}

declare module '../public/images/*.webp?*' {
  const value: any;
  export default value;
}
