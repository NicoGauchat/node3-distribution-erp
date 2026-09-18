import type { MatchStatus, OrderLine, Product, SaleUnit } from "./types";
import { normalizeText } from "./format";

const directNumberWords: Record<string, number> = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
  trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
  dieciocho: 18, diecinueve: 19, veinte: 20, veintiun: 21, veintiuno: 21,
  veintiuna: 21, veintidos: 22, veintitres: 23, veinticuatro: 24,
  veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28,
  veintinueve: 29,
};

const tens: Record<string, number> = {
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60,
  setenta: 70, ochenta: 80, noventa: 90,
};

const hundreds: Record<string, number> = {
  cien: 100, ciento: 100, doscientos: 200, doscientas: 200,
  trescientos: 300, trescientas: 300, cuatrocientos: 400, cuatrocientas: 400,
  quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600,
  setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800,
  novecientos: 900, novecientas: 900,
};

const unitWords = new Set(["un", "uno", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"]);
const tensWords = new Set(Object.keys(tens));
const ignoredInstruction = /^(si no hay|si falta|si faltan|si no tienen|avisame|avisenme|cuando llegue|cuando lleguen)/;

function parseNumberWords(words: string[], start: number): { value: number; consumed: number } | null {
  let current = 0;
  let total = 0;
  let consumed = 0;
  let found = false;

  for (let index = start; index < words.length; index += 1) {
    const word = words[index];
    if (word in directNumberWords) {
      current += directNumberWords[word];
    } else if (word in tens) {
      current += tens[word];
    } else if (word in hundreds) {
      current += hundreds[word];
    } else if (word === "mil") {
      total += (current || 1) * 1_000;
      current = 0;
    } else if (word === "millon" || word === "millones") {
      total += (current || 1) * 1_000_000;
      current = 0;
    } else if (word === "y" && found && index + 1 < words.length && unitWords.has(words[index + 1])) {
      consumed += 1;
      continue;
    } else {
      break;
    }
    found = true;
    consumed += 1;
  }

  return found ? { value: total + current, consumed } : null;
}

function quantityFrom(text: string): number | null {
  const numeric = text.match(/\b\d+(?:[.,]\d+)?\b/);
  if (numeric) return Number(numeric[0].replace(",", "."));

  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  for (let index = 0; index < words.length; index += 1) {
    const parsed = parseNumberWords(words, index);
    if (parsed) return parsed.value;
  }
  return null;
}

function detectQuantity(text: string): number {
  return Math.max(1, quantityFrom(text) ?? 1);
}

function detectUnit(text: string, fallback: SaleUnit): SaleUnit {
  const value = normalizeText(text);
  if (/\bkilos?\b|\bkg\b/.test(value)) return "kilo";
  if (/\bcajas?\b/.test(value)) return "caja";
  if (/\bbultos?\b/.test(value)) return "bulto";
  if (/\bpaquetes?\b/.test(value)) return "paquete";
  return fallback;
}

function stemWord(word: string): string {
  let singular = word;
  if (word.length > 5 && word.endsWith("es")) singular = word.slice(0, -2);
  else if (word.length > 4 && word.endsWith("s")) singular = word.slice(0, -1);
  if (singular === "audio") return "oreo";
  return singular;
}

function searchableWords(value: string): string[] {
  return normalizeText(value).split(/\s+/).filter((word) => word.length > 2).map(stemWord);
}

function scoreProduct(text: string, product: Product): number {
  const normalized = normalizeText(text);
  const candidates = [product.name, product.brand, ...product.aliases].map(normalizeText).filter(Boolean);
  if (candidates.some((candidate) => normalized.includes(candidate))) return 1;

  const words = new Set(searchableWords(text));
  const phraseMatch = candidates.some((candidate) => {
    const candidateWords = searchableWords(candidate);
    return candidateWords.length > 0 && candidateWords.every((word) => words.has(word));
  });
  if (phraseMatch) return 1;

  const productWords = new Set(candidates.flatMap(searchableWords));
  const hits = [...words].filter((word) => productWords.has(word)).length;
  return hits / Math.max(2, Math.min(words.size, productWords.size));
}

function splitConjunctions(text: string): string[] {
  const words = text.trim().split(/\s+/);
  const result: string[] = [];
  let current: string[] = [];

  words.forEach((word, index) => {
    const normalized = normalizeText(word).replace(/[^a-z0-9]/g, "");
    const previous = normalizeText(words[index - 1] ?? "").replace(/[^a-z0-9]/g, "");
    const next = normalizeText(words[index + 1] ?? "").replace(/[^a-z0-9]/g, "");
    const numberConnector = normalized === "y" && tensWords.has(previous) && unitWords.has(next);
    if (normalized === "y" && !numberConnector) {
      if (current.length) result.push(current.join(" "));
      current = [];
      return;
    }
    current.push(word);
  });

  if (current.length) result.push(current.join(" "));
  return result;
}

const nonDescriptionWords = new Set([
  "caja", "cajas", "paquete", "paquetes", "bulto", "bultos", "unidad", "unidades",
  "kilo", "kilos", "kg", "gramo", "gramos", "gr", "litro", "litros", "ml",
  "de", "del", "la", "las", "el", "los", "por", "para", "x",
]);

function quantityAt(words: string[], index: number): { value: number; consumed: number } | null {
  const normalizedWords = words.map((word) => normalizeText(word).replace(/[^a-z0-9.,]/g, ""));
  const numeric = normalizedWords[index]?.match(/^\d+(?:[.,]\d+)?$/);
  if (numeric) return { value: Number(numeric[0].replace(",", ".")), consumed: 1 };
  return parseNumberWords(normalizedWords, index);
}

function hasDescription(words: string[]): boolean {
  return words.some((word) => {
    const normalized = normalizeText(word).replace(/[^a-z0-9]/g, "");
    return normalized.length > 2 && !nonDescriptionWords.has(normalized);
  });
}

function splitRepeatedQuantities(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const quantityStarts: Array<{ index: number; consumed: number }> = [];

  for (let index = 0; index < words.length;) {
    const quantity = quantityAt(words, index);
    if (quantity && quantity.value > 0) {
      quantityStarts.push({ index, consumed: quantity.consumed });
      index += Math.max(1, quantity.consumed);
    } else {
      index += 1;
    }
  }

  if (quantityStarts.length < 2) return [text];

  const accepted = [quantityStarts[0]];
  quantityStarts.slice(1).forEach((candidate) => {
    const previous = accepted[accepted.length - 1];
    const beforeCandidate = words.slice(previous.index + previous.consumed, candidate.index);
    const afterCandidate = words.slice(candidate.index + candidate.consumed);
    if (hasDescription(beforeCandidate) && hasDescription(afterCandidate)) accepted.push(candidate);
  });

  if (accepted.length < 2) return [text];
  return accepted.map((start, index) => {
    const from = index === 0 ? 0 : start.index;
    const to = accepted[index + 1]?.index ?? words.length;
    return words.slice(from, to).join(" ");
  });
}

function splitSegments(text: string): string[] {
  return text
    .split(/\r?\n+|[,;]+/)
    .flatMap(splitConjunctions)
    .flatMap(splitRepeatedQuantities)
    .map((segment) => segment.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function interpretMessage(text: string, products: Product[]): OrderLine[] {
  return splitSegments(text).flatMap((originalText, index) => {
    const normalized = normalizeText(originalText);
    if (ignoredInstruction.test(normalized)) return [];

    const scored = products
      .filter((product) => product.active)
      .map((product) => ({ product, score: scoreProduct(originalText, product) }))
      .filter((item) => item.score >= 0.25)
      .sort((a, b) => b.score - a.score);
    const best = scored[0];
    const explicitQuantity = quantityFrom(originalText);
    if (!best && explicitQuantity === null) return [];

    const ambiguous = Boolean(best && scored[1] && Math.abs(best.score - scored[1].score) < 0.15);
    let matchStatus: MatchStatus = "not_found";
    if (best?.score === 1) matchStatus = "recognized";
    else if (ambiguous) matchStatus = "review";
    else if (best && best.score >= 0.45) matchStatus = "possible";
    else if (best) matchStatus = "review";
    const product = best?.product ?? null;
    const quantity = detectQuantity(originalText);

    return [{
      id: `draft-line-${Date.now()}-${index}`,
      productId: product?.id ?? null,
      originalText,
      packages: quantity,
      quantity,
      unit: detectUnit(originalText, product?.saleUnit ?? "unidad"),
      unitPrice: product?.price ?? 0,
      discount: 0,
      matchStatus,
      matchConfidenceDemo: best?.score ?? 0,
    }];
  });
}
