import { Prisma, PrismaClient } from '@prisma/client'

import omit from 'lodash/omit'

type ModelName = keyof Prisma.TypeMap['model']
type DelegateFor<TModel extends ModelName> = PrismaClient[TModel]
type FindManyArgs<TModel extends ModelName> = Prisma.Args<DelegateFor<TModel>, 'findMany'>

const paginationExtension = () => {
  return Prisma.defineExtension({
    name: 'pagination',
    model: {
      $allModels: {
        async paginate<TModel extends ModelName, TArgs extends FindManyArgs<TModel>>(
          args: TArgs & { page?: number; limit?: number }
        ) {
          const page = args.page ?? 1
          const limit = args.limit ?? 10
          const skip = (page - 1) * limit

          const context: any = Prisma.getExtensionContext(this)
          const originalArgs = omit(args, ['page', 'limit'])

          const [data, total] = await Promise.all([
            context.findMany({
              ...originalArgs,
              skip,
              take: limit,
            }),
            context.count({ where: originalArgs?.where || {} }),
          ])

          const last_page = Math.ceil(total / limit)
          const from = skip >= total ? null : skip + 1
          const to = !from ? null : Math.min(skip + limit, total)

          return {
            current_page: page,
            per_page: limit,
            last_page,
            total,
            from,
            to,
            data,
          }
        },
      },
    },
  })
}

export const prismaX = new PrismaClient().$extends(paginationExtension())
