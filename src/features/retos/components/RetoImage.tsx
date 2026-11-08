"use client";
import Image from "next/image";
import { useState } from "react";

type Props = { src: string; alt: string; className: string };

function ImageWithFallback({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div role="img" aria-label={`${alt}: no disponible`} className={`flex min-h-28 items-center justify-center bg-water/10 p-4 text-center text-water-dark ${className}`}>
      Imagen no disponible
    </div>
  ) : (
    <Image unoptimized width={960} height={540} src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}

export function RetoImage(props: Props) {
  // Una URL nueva debe poder cargar aunque la anterior haya fallado.
  return <ImageWithFallback key={props.src} {...props} />;
}
