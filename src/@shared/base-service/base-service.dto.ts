import { PopulateOptions } from 'mongoose';
import { SortTypeEnum } from '../dto/common.dto';

export class BaseServiceQueryOptions<Doc> {
  populate?: string;
  projection?: Record<string, number | boolean | string | object>;
  populateArrObject?: PopulateOptions[];
}

export class FindAllServiceOptions<
  Doc,
  T,
> extends BaseServiceQueryOptions<Doc> {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort: SortTypeEnum;
  map?: (doc: Doc) => T | PromiseLike<T>;
}

export type ProjectionDto = Record<string, number | boolean | string | object>;
