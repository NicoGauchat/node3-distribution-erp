import type { MatchStatus, OrderLine, Product, SaleUnit } from "./types";
import { normalizeText } from "./format";

const numberWords: Record<string, number> = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, veinte: 20 };

function detectQuantity(text: string): number {
  const numeric = text.match(/\b\d+(?:[.,]\d+)?\b/);
  if (numeric) return Number(numeric[0].replace(",", "."));
  const normalized = normalizeText(text);
  for (const [word, value] of Object.entries(numberWords)) {
    if (new RegExp(`\\b${word}\\b`).test(normalized)) return value;
  }
  return 1;
}

function detectUnit(text: string, fallback: SaleUnit): SaleUnit {
  const value = normalizeText(text);
  if (/\bkilos?\b|\bkg\b/.test(value)) return "kilo";
  if (/\bcajas?\b/.test(value)) return "caja";
  if (/\bbultos?\b/.test(value)) return "bulto";
  if (/\bpaquetes?\b/.test(value)) return "paquete";
  return fallback;
}

function scoreProduct(text: string, product: Product): number {
  const normalized = normalizeText(text);
  const candidates = [product.name, product.brand, ...product.aliases].map(normalizeText).filter(Boolean);
  if (candidates.some((candidate) => normalized.includes(candidate))) return 1;
  const words = new Set(normalized.split(" ").filter((word) => word.length > 2));
  const productWords = new Set(candidates.join(" ").split(" ").filter((word) => word.length > 2));
  const hits = [...words].filter((word) => productWords.has(word)).length;
  return hits / Math.max(2, Math.min(words.size, productWords.size));
}

export function interpretMessage(text: string, products: Product[]): OrderLine[] {
  const segments = text.split(/\n+|,(?=\s*\d)|\s+y\s+(?=\d)/i).map((segment) => segment.replace(/^[-•*]\s*/, "").trim()).filter((segment) => /\d|\b(un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|veinte)\b/i.test(segment));
  return segments.map((originalText, index) => {
    const scored = products.filter((product) => product.active).map((product) => ({ product, score: scoreProduct(originalText, product) })).filter((item) => item.score >= 0.25).sort((a, b) => b.score - a.score);
    const best = scored[0];
    const ambiguous = Boolean(best && scored[1] && Math.abs(best.score - scored[1].score) < 0.15);
    let matchStatus: MatchStatus = "not_found";
    if (best?.score === 1) matchStatus = "recognized";
    else if (ambiguous) matchStatus = "review";
    else if (best && best.score >= 0.45) matchStatus = "possible";
    else if (best) matchStatus = "review";
    const product = best?.product ?? null;
    const quantity = detectQuantity(originalText);
    return { id: `draft-line-${Date.now()}-${index}`, productId: product?.id ?? null, originalText, packages: quantity, quantity, unit: detectUnit(originalText, product?.saleUnit ?? "unidad"), unitPrice: product?.price ?? 0, discount: 0, matchStatus, matchConfidenceDemo: best?.score ?? 0 };
  });
}
