import * as Koa from 'koa';
import { getRepository, Repository } from 'typeorm';
import { FORBIDDEN } from 'http-status-codes';
import userEntity from '../models/user.entity';

export default async (ctx: Koa.Context, next: () => Promise<any>) => {
  const userRepo: Repository<userEntity> = getRepository(userEntity);
  const currentUser = await userRepo.findOne(ctx.state.user.id);

  ctx.assert(currentUser.isAdmin, FORBIDDEN);
  return next();
};