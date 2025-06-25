import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  ClientSession,
} from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  BaseServiceQueryOptions,
  FindAllServiceOptions,
} from './base-service.dto';

interface PopulateOption {
  path: string;
  populate?: PopulateOption[];
  select?: string;
}

@Injectable()
export class BaseService<T extends Document> {
  private _mongoSession?: ClientSession;
  private _sessionSettledManual: boolean;

  constructor(private readonly model: Model<T>) {}

  // Transaction Handling Methods
  public setMongoSession(mongoSession?: ClientSession) {
    this._mongoSession = mongoSession;
    this._sessionSettledManual = true;
    return this;
  }

  public get mongoSession() {
    return this._mongoSession;
  }

  public get isManual() {
    return this._sessionSettledManual;
  }

  protected async newMongoSession() {
    if (this._sessionSettledManual) {
      return;
    }
    this._mongoSession = await this.model.db.startSession();
  }

  protected startMongoTransaction() {
    if (this._sessionSettledManual) {
      return;
    }
    if (this._mongoSession) {
      this._mongoSession.startTransaction();
    }
  }

  protected async commitMongoTransaction() {
    if (this._sessionSettledManual) {
      return;
    }
    if (this._mongoSession && this._mongoSession.inTransaction()) {
      await this._mongoSession.commitTransaction();
    }
    this.endMongoSession();
  }

  protected async abortMongoTransaction() {
    if (this._sessionSettledManual) {
      return;
    }
    if (this._mongoSession && this._mongoSession.inTransaction()) {
      await this._mongoSession.abortTransaction();
    }
    this.endMongoSession();
  }

  public async endMongoSession() {
    try {
      if (this._mongoSession) {
        await this._mongoSession.endSession();
      }
    } catch (err) {
      console.warn('Failed to end session:', err.message);
    } finally {
      this._mongoSession = undefined;
      this._sessionSettledManual = false;
    }
  }

  // expose raw model
  get modelRaw(): Model<T> {
    return this.model;
  }

  // CRUD Methods with Optional Session
  async create(createDto: any): Promise<T> {
    const createdEntity = new this.model(createDto);
    return await createdEntity.save({ session: this._mongoSession });
  }

  // Find all documents with optional filter, pagination, sorting, populate, and session
  async findAll<ResultDto>(
    filter: FilterQuery<T> = {},
    options: FindAllServiceOptions<T, ResultDto>,
  ): Promise<{ result: ResultDto[]; total_data: number }> {
    const {
      page = 1,
      per_page = 10,
      sort_by,
      sort = 'asc',
      populate = '',
      projection,
      map = (doc: any) => doc,
      populateArrObject,
    } = options;

    const sortQuery: any = {};
    if (sort_by) {
      sortQuery[`${sort_by}`] = sort;
    }

    const query = this.model
      .find(filter)
      .sort(sortQuery)
      .skip((page - 1) * per_page)
      .limit(per_page);

    // Apply dynamic population if specified
    if (populate) {
      query.populate(this.convertPopulateString(populate));
    }

    if (populateArrObject) {
      query.populate(populateArrObject);
    }

    if (projection) {
      query.select(projection);
    }

    // Apply session if specified
    if (this._mongoSession) {
      query.session(this._mongoSession);
    }

    const [result, total_data] = await Promise.all([
      query.then((results) => Promise.all(results.map(map))),
      this.model.countDocuments(filter),
    ]);

    return { result, total_data };
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async findOne(
    filter?: FilterQuery<T>,
    options?: BaseServiceQueryOptions<T>,
  ): Promise<T | null> {
    const { populate, populateArrObject, projection } = options || {};
    const query = this.model.findOne(filter || {});
    if (populate) {
      query.populate(this.convertPopulateString(populate));
    }
    if (populateArrObject) {
      query.populate(populateArrObject);
    }
    if (projection) {
      query.select(projection);
    }
    if (this._mongoSession) {
      query.session(this._mongoSession);
    }
    return await query;
  }

  async findById(
    id: string,
    options?: BaseServiceQueryOptions<T>,
  ): Promise<T | null> {
    const { populate, populateArrObject, projection } = options || {};
    const query = this.model.findById(id);
    if (populate) {
      query.populate(this.convertPopulateString(populate));
    }
    if (populateArrObject) {
      query.populate(populateArrObject);
    }
    if (projection) {
      query.select(projection);
    }
    if (this._mongoSession) {
      query.session(this._mongoSession);
    }
    return await query;
  }

  async update(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
  ): Promise<{ dataBefore: T | null; dataAfter: T | null }> {
    const dataBefore = await this.model.findOneAndUpdate(filter, updateDto, {
      new: false, // Return the document before the update
      session: this._mongoSession,
    });

    if (!dataBefore) {
      return { dataBefore, dataAfter: null };
    }

    const dataBeforeObject = dataBefore.toObject();
    // If the document exists, apply the changes and return dataAfter as the updated document
    const dataAfter = dataBefore ? { ...dataBeforeObject, ...updateDto } : null;

    return { dataBefore, dataAfter };
  }

  async updateOrCreate(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
  ): Promise<{ dataBefore: T | null; dataAfter: T | null }> {
    const dataBefore = await this.model.findOneAndUpdate(filter, updateDto, {
      new: false, // Return the document before the update
      session: this._mongoSession,
    });

    if (!dataBefore) {
      const newDocument = new this.model(updateDto);
      const dataAfter = await newDocument.save({ session: this._mongoSession });
      return { dataBefore: null, dataAfter };
    }

    // If the document exists, apply the changes and return dataAfter as the updated document
    const dataBeforeObject = dataBefore.toObject();
    const dataAfter = { ...dataBeforeObject, ...updateDto };

    return { dataBefore, dataAfter };
  }

  async delete(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOneAndDelete(filter, {
      session: this._mongoSession,
    });
  }

  private convertPopulateString(populateStr: string): PopulateOption[] {
    const paths = populateStr.split(' ');
    const populateMap: Record<string, any> = {};

    // Build nested populate map
    paths.forEach((path) => {
      const [pathPart, select] = path.split(':'); // Split path and select
      const parts = pathPart.split('.');
      let current = populateMap;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = { path: part };
        }

        // Add select if it's the last part of the path
        if (index === parts.length - 1) {
          current[part] = { path: part, select: select || undefined };
        } else {
          // Ensure `populate` exists for nesting
          if (!current[part].populate) {
            current[part].populate = {};
          }
          current = current[part].populate;
        }
      });
    });

    // Recursive function to map the nested structure to an array
    function mapToPopulateArray(obj: Record<string, any>): PopulateOption[] {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return Object.entries(obj).map(([key, value]) => {
        const mapped: PopulateOption = { path: value.path };

        // Add `select` if it exists
        if (value.select) {
          mapped.select = value.select;
        }

        // Recursively convert nested objects to `populate` arrays
        if (value.populate && Object.keys(value.populate).length > 0) {
          mapped.populate = mapToPopulateArray(value.populate);
        }

        return mapped;
      });
    }

    return mapToPopulateArray(populateMap);
  }
}
