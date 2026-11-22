import { teachingSnapshot } from '@/domain/teachingSnapshot';
import { state } from '@/store/memory';
import { baseProcedure, createTRPCRouter } from '../init';

export const compareRouter = createTRPCRouter({
  get: baseProcedure.query(() => teachingSnapshot(state()).compare()),
});
