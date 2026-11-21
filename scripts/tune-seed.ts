
import { SEED } from "../src/data/seed";
import { cleanSampleEngine } from "../src/engine/sample/classify";

let ok = 0;
for (const s of SEED) {
  const r = cleanSampleEngine.classify(s.text);
  if (r.misconceptionId === s.gold) ok++;
  else console.log(`${s.id} gold=${s.gold} got=${r.misconceptionId} ${JSON.stringify(r.candidates)} | ${s.text}`);
}
console.log(`seed agreement ${ok}/${SEED.length}`);
