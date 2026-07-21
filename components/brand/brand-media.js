"use client";

import Image from "next/image";
import { BRAND_ASSETS } from "@/lib/brand-assets";

/** Full logo — login header, topbar. */
export function BrandLogoFull({ className, alt, priority }) {
  return (
    <Image
      src={BRAND_ASSETS.logo}
      alt={alt}
      width={200}
      height={48}
      sizes="(max-width: 768px) 180px, 200px"
      className={className}
      priority={!!priority}
      unoptimized
    />
  );
}

export function BrandLogoMark({ className, alt, priority }) {
  return (
    <Image
      src={BRAND_ASSETS.logoMark}
      alt={alt}
      width={40}
      height={40}
      className={className}
      priority={!!priority}
      unoptimized
    />
  );
}

export function BrandLogoLoading({ className, alt, priority }) {
  return (
    <Image
      src={BRAND_ASSETS.logoLoading}
      alt={alt}
      width={200}
      height={48}
      className={className}
      priority={!!priority}
      unoptimized
    />
  );
}
