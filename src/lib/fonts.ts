export const postFonts = [
  { id: "geist", label: "Geist", variable: "" },
  { id: "comico", label: "Comico", variable: "--font-comico" },
  { id: "heal", label: "Heal The Web", variable: "--font-heal" },
  { id: "boron", label: "Boring Boron", variable: "--font-boron" },
  { id: "gabriele", label: "Gabriele", variable: "--font-gabriele" },
  { id: "chops", label: "Mister Licky Chops", variable: "--font-chops" },
] as const;

export type PostFontId = (typeof postFonts)[number]["id"];

export function isPostFont(value: string): value is PostFontId {
  return postFonts.some((font) => font.id === value);
}

export function postFontFamily(id: string | undefined): string | undefined {
  const variable = postFonts.find((font) => font.id === id)?.variable;
  if (!variable) return undefined;
  return `var(${variable}), var(--font-sans), sans-serif`;
}
