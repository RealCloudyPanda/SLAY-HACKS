import { teachingBrief } from "@/domain/brief";
import { heatmap } from "@/domain/heatmap";
import { teachFirst } from "@/domain/ranking";
import { state } from "@/store/memory";
import { baseProcedure, createTRPCRouter } from "../init";
import { labelled, nameOf, reviewItems } from "./shared";

export const dashboardRouter = createTRPCRouter({
  summary: baseProcedure.query(() => {
    const s = state();
    const l = labelled(s.reports);
    const tf = teachFirst(l);
    const hm = heatmap(l, tf.map((t) => t.id));
    return {
      briefOptions: tf.filter((t) => t.count > 0).map((t) => teachingBrief({ reports: s.reports, names: s.misconceptions }, [t.id]).concepts[0]),
      totals: {
        reports: s.reports.length,
        assigned: s.reports.filter((r) => r.assignment.label !== "abstain").length,
        review: reviewItems().length,
        corrected: s.reports.filter((r) => r.assignment.source !== "ai").length,
      },
      teachFirst: tf.map((t) => ({ ...t, name: nameOf(t.id) })),
      heatmap: { ...hm, rows: hm.rows.map((r) => ({ ...r, name: nameOf(r.id) })) },
      recentCorrections: s.corrections.slice(0, 8).map((c) => ({
        ...c,
        text: c.reportId ? s.reports.find((r) => r.id === c.reportId)?.text : undefined,
        fromName: c.from && c.from !== "abstain" ? nameOf(c.from) : c.from,
        toName: c.to && c.to !== "abstain" ? nameOf(c.to) : c.to,
        misconceptionName: c.misconceptionId ? nameOf(c.misconceptionId) : undefined,
      })),
      engine: s.engine,
    };
  }),
});
