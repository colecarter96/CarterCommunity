import Image from "next/image";
import Link from "next/link";
import { DiscordLink } from "@/components/discord-link";
import { wordmark } from "@/lib/mark";
import { shell } from "@/lib/site";

export function Header() {
  return (
    <header id="top" className="sticky top-0 z-20 bg-background">
      <div className={`${shell} relative flex h-14 items-center justify-center md:h-16`}>
        <Link href="/#top" className="block">
          <Image
            id="site-mark"
            src={wordmark.src}
            alt={wordmark.alt}
            width={wordmark.width}
            height={wordmark.height}
            unoptimized
            preload
            className="h-7 w-auto md:h-9"
          />
        </Link>
        <DiscordLink className="absolute right-5 md:right-8" />
      </div>
    </header>
  );
}
