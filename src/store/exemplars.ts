import type { MisconceptionId } from "@/domain/types";
import type { Exemplars } from "@/engine/sample/classify";

export const EXEMPLAR_MAX = 20;

export function addExemplar(ex: Exemplars, id: MisconceptionId, text: string, max = EXEMPLAR_MAX): void {
  const list = (ex[id] ?? []).filter((t) => t !== text);
  list.push(text);
  ex[id] = list.slice(-max);
}

export function removeExemplar(ex: Exemplars, text: string): void {
  for (const k of Object.keys(ex) as MisconceptionId[]) ex[k] = ex[k]!.filter((t) => t !== text);
}
