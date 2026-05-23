import Image from "next/image";

interface LogoProps {
  variant?: "navy" | "white";
  height?: number;
  className?: string;
}

export default function Logo({ variant = "navy", height = 36, className = "" }: LogoProps) {
  const src = variant === "white" ? "/logo2.png" : "/logo.png";
  // both logos are 1000×300 — 10:3 aspect ratio
  const width = Math.round(height * (10 / 3));

  return (
    <Image
      src={src}
      alt="Compleros"
      width={width}
      height={height}
      quality={100}
      className={className}
      priority
    />
  );
}
