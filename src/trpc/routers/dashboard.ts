import { teachingSnapshot } from '@/domain/teachingSnapshot';
import { state } from '@/store/memory';
import { baseProcedure, createTRPCRouter } from '../init';

export const dashboardRouter = createTRPCRouter({
  summary: baseProcedure.query(() => teachingSnapshot(state()).dashboard()),
});
