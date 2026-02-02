import { PrismaClient } from '@prisma/client';

// Fields to exclude from general filtering, these are handled by specific methods
const excludeField = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

export class PrismaQueryBuilder { // T will now represent the type of the model's data, not the model itself
  public prismaClient: PrismaClient;
  public modelName: keyof PrismaClient;
  public query: Record<string, string>;
  public prismaOptions: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    select?: Record<string, boolean>;
    skip?: number;
    take?: number;
  };

  constructor(prismaClient: PrismaClient, modelName: keyof PrismaClient, query: Record<string, string>) {
    this.prismaClient = prismaClient;
    this.modelName = modelName;
    this.query = query;
    this.prismaOptions = {};
  }

  filter(): this {
    const filterConditions: Record<string, unknown> = {};

    for (const key in this.query) {
      if (!excludeField.includes(key)) {
        const value = this.query[key];
        const match = key.match(/(\w+)\[(gte|lte|gt|lt|in|not|contains|startsWith|endsWith)\]/);

        if (match) {
          const [, field, operator] = match;
          if (operator === 'in') {
            filterConditions[field] = { in: value.split(',') };
          } else if (operator === 'contains' || operator === 'startsWith' || operator === 'endsWith') {
            filterConditions[field] = { [operator]: value, mode: 'insensitive' };
          } else {
            filterConditions[field] = { [operator]: value };
          }
        } else {
          filterConditions[key] = value;
        }
      }
    }
    this.prismaOptions.where = { ...this.prismaOptions.where, ...filterConditions };
    return this;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm;
    if (searchTerm && searchableFields.length > 0) {
      const searchConditions = searchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive', // Case-insensitive search
        },
      }));
      this.prismaOptions.where = {
        ...this.prismaOptions.where,
        OR: searchConditions,
      };
    }
    return this;
  }

  sort(): this {
    const sort = this.query.sort || '-createdAt'; // Default sort by createdAt descending
    const orderBy: Record<string, 'asc' | 'desc'> = {};

    if (sort.startsWith('-')) {
      orderBy[sort.substring(1)] = 'desc';
    } else {
      orderBy[sort] = 'asc';
    }
    this.prismaOptions.orderBy = orderBy;
    return this;
  }

  fields(): this {
    const fields = this.query.fields;
    if (fields) {
      const selectFields = fields.split(',').reduce((acc, field) => {
        acc[field.trim()] = true;
        return acc;
      }, {} as Record<string, boolean>);
      this.prismaOptions.select = selectFields;
    }
    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.prismaOptions.skip = skip;
    this.prismaOptions.take = limit;
    return this;
  }

  build(): {
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    select?: Record<string, boolean>;
    skip?: number;
    take?: number;
  } {
    return this.prismaOptions;
  }

  async getMeta(): Promise<{
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalDocuments = await (this.prismaClient[this.modelName] as any).count({ where: this.prismaOptions.where });

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}
