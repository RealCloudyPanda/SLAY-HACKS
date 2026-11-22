import { teachingSnapshot } from '@/domain/teachingSnapshot';
import { state } from '@/store/memory';
import { baseProcedure, createTRPCRouter } from '../init';

export const reviewRouter = createTRPCRouter({
  list: baseProcedure.query(() => teachingSnapshot(state()).review()),
});
