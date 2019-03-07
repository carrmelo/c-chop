import * as Koa from 'koa';
import { getRepository, Repository } from 'typeorm';
import {
  OK,
  NOT_FOUND,
  CREATED,
  NO_CONTENT,
  ACCEPTED,
  BAD_REQUEST,
} from 'http-status-codes';
import customerEntity from '../models/customer.entity';
import userEntity from '../models/user.entity';
import anyFieldIsWrong from '../lib/entityValidator';

export const getAllCustomers = async (ctx: Koa.Context) => {
  const customerRepo: Repository<customerEntity> = getRepository(
    customerEntity,
  );

  const customers = await customerRepo.find();

  ctx.status = OK;
  ctx.body = { data: { customers } };
};

export const getCustomer = async (ctx: Koa.Context) => {
  const customerRepo: Repository<customerEntity> = getRepository(
    customerEntity,
  );

  const customer = await customerRepo.findOne(ctx.params.customer_id);

  if (!customer) {
    ctx.throw(NOT_FOUND);
  }

  ctx.status = OK;
  ctx.body = { data: { customer } };
};

export const createCustomer = async (ctx: Koa.Context) => {
  const customerRepo: Repository<customerEntity> = getRepository(
    customerEntity,
  );
  const userRepo: Repository<userEntity> = getRepository(userEntity);

  const { name, surname, pictureUrl } = ctx.request.body;
  const createdBy = await userRepo.findOne(ctx.state.user.id);

  let customer: customerEntity = customerRepo.create({
    name,
    surname,
    pictureUrl,
    createdBy,
  });

  if (await anyFieldIsWrong(customer)) {
    ctx.throw(BAD_REQUEST, 'Please check your customer fields');
  }

  customer = await customerRepo.save(customer);
  console.log('fdddddddd', customer);
  const userrrrr = await userRepo.find({ relations: ['created'] });
  const userrrrr2 = await userRepo.findOne(ctx.state.user.id, {
    relations: ['created', 'modified'],
  });

  ctx.status = CREATED;
  ctx.body = { data: customer };
};

export const deleteCustomer = async (ctx: Koa.Context) => {
  const customerRepo: Repository<customerEntity> = getRepository(
    customerEntity,
  );

  const customer = await customerRepo.findOne(ctx.params.customer_id);

  if (!customer) {
    ctx.throw(NOT_FOUND);
  }

  await customerRepo.delete(customer);

  ctx.status = NO_CONTENT;
};

export const editCustomer = async (ctx: Koa.Context) => {
  const customerRepo: Repository<customerEntity> = getRepository(
    customerEntity,
  );

  let customer = await customerRepo.findOne(ctx.params.customer_id);

  if (!customer) {
    ctx.throw(NOT_FOUND);
  }

  const { body } = ctx.request;
  body.modifiedBy = ctx.state.user.id;

  customer = await customerRepo.merge(customer, body);

  if (await anyFieldIsWrong(customer)) {
    ctx.throw(BAD_REQUEST, 'Please check your customer fields');
  }

  await customerRepo.save(customer);

  ctx.status = ACCEPTED;
  ctx.body = { data: { customer } };
};
