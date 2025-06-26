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

/**
 * BaseService provides transactional and CRUD operations with Mongoose,
 * supporting session-aware operations and dynamic population.
 */
@Injectable()
export class BaseService<T extends Document> {
  private _mongoSession?: ClientSession;
  private _sessionSettledManual: boolean;

  constructor(private readonly model: Model<T>) {}

  /**
   * Set a MongoDB session manually.
   * @param mongoSession - Optional Mongoose ClientSession.
   * @returns The current service instance.
   */
  public setMongoSession(mongoSession?: ClientSession) {
    this._mongoSession = mongoSession;
    this._sessionSettledManual = true;
    return this;
  }

  /**
   * Get the current MongoDB session.
   */
  public get mongoSession() {
    return this._mongoSession;
  }

  /**
   * Check whether the session is set manually.
   */
  public get isManual() {
    return this._sessionSettledManual;
  }

  /**
   * Start a new MongoDB session if one isn't manually set.
   */
  protected async newMongoSession() {
    if (this._sessionSettledManual) {
      return;
    }
    this._mongoSession = await this.model.db.startSession();
  }

  /**
   * Begin a transaction using the current session, unless manually managed.
   */
  protected startMongoTransaction() {
    if (this._sessionSettledManual) {
      return;
    }
    if (this._mongoSession) {
      this._mongoSession.startTransaction();
    }
  }

  /**
   * Commit the current MongoDB transaction.
   */
  protected async commitMongoTransaction() {
    if (this._sessionSettledManual) {
      return;
    }
    if (this._mongoSession && this._mongoSession.inTransaction()) {
      await this._mongoSession.commitTransaction();
    }
    this.endMongoSession();
  }

  /**
   * Abort the current MongoDB transaction.
   */
  protected async abortMongoTransaction() {
    if (this._sessionSettledManual) {
      return;
    }
    if (this._mongoSession && this._mongoSession.inTransaction()) {
      await this._mongoSession.abortTransaction();
    }
    this.endMongoSession();
  }

  /**
   * End and clean up the current MongoDB session.
   */
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

  /**
   * Get the raw Mongoose model.
   */
  get modelRaw(): Model<T> {
    return this.model;
  }

  /**
   * Create a new document in the collection.
   * @param createDto - Data to create the document.
   * @returns The created document.
   */
  async create(createDto: any): Promise<T> {
    const createdEntity = new this.model(createDto);
    return await createdEntity.save({ session: this._mongoSession });
  }

  /**
   * Find all documents with filtering, sorting, pagination, and population.
   * @param filter - Query filter.
   * @param options - Options for pagination, sorting, population, projection, and mapping.
   * @returns Paginated results with total data count.
   */
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

  /**
   * Count documents that match a given filter.
   * @param filter - Query filter.
   * @returns Number of documents.
   */
  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  /**
   * Find a single document by filter, with optional population and projection.
   * @param filter - Query filter.
   * @param options - Population and projection options.
   * @returns The matching document or null.
   */
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

  /**
   * Find a single document by ID, with optional population and projection.
   * @param id - Document ID.
   * @param options - Population and projection options.
   * @returns The matching document or null.
   */
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
    return await query.exec();
  }

  /**
   * Update a document matching the filter.
   * @param filter - Query filter.
   * @param updateDto - Fields to update.
   * @returns The document before and after the update.
   */
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

    const dataAfter = {
      ...dataBefore.toObject(),
      ...updateDto,
    };

    return { dataBefore, dataAfter };
  }

  /**
   * Update a document if it exists, otherwise create a new one.
   * @param filter - Query filter.
   * @param updateDto - Fields to update or create.
   * @returns The document before and after the operation.
   */
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

  /**
   * Delete a document matching the filter.
   * @param filter - Query filter.
   * @returns The deleted document, if any.
   */
  async delete(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOneAndDelete(filter, {
      session: this._mongoSession,
    });
  }

  /**
   * Convert a space-separated populate string into a structured populate object array.
   * Supports nested population using dot notation and field selection using colon.
   *
   * Example: 'author.name comments.user:email'
   *
   * @param populateStr - Populate string (e.g., "author.name comments.user:email").
   * @returns Array of structured populate options for Mongoose.
   */
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
