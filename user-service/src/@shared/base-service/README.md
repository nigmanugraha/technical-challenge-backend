# BaseService<T>

`BaseService<T>` is an abstract, reusable generic service class for Mongoose models in NestJS. It provides standard database operations (CRUD), pagination, population, session management, and transaction support — all with clean abstraction.

## 🧱 Features

- Generic CRUD for any Mongoose model
- MongoDB transaction & session support
- Flexible population of references (`populate` string or array)
- Pagination, sorting, projection support
- Supports `updateOrCreate` logic
- Utility to convert `populate` strings to nested population trees

---

## 📦 Constructor

```ts
constructor(private readonly model: Model<T>)
```

- Injects a Mongoose model

---

## 🔄 Transaction & Session Methods

```ts
setMongoSession(session?: ClientSession): this
```

- Manually sets a MongoDB session

```ts
get mongoSession: ClientSession | undefined
get isManual: boolean
```

- Get current session or whether it was set manually

```ts
protected async newMongoSession()
protected startMongoTransaction()
protected async commitMongoTransaction()
protected async abortMongoTransaction()
public async endMongoSession()
```

- Controls session lifecycle and transaction boundaries

---

## 📄 CRUD Methods

### create

```ts
async create(createDto: any): Promise<T>
```

- Creates and saves a new document using the current session

### findAll

```ts
async findAll<ResultDto>(
  filter: FilterQuery<T>,
  options: FindAllServiceOptions<T, ResultDto>
): Promise<{ result: ResultDto[]; total_data: number }>
```

- Finds paginated list of documents with sorting, projection, `populate`, and mapping

### findOne

```ts
async findOne(
  filter?: FilterQuery<T>,
  options?: BaseServiceQueryOptions<T>
): Promise<T | null>
```

- Finds a single document

### findById

```ts
async findById(
  id: string,
  options?: BaseServiceQueryOptions<T>
): Promise<T | null>
```

- Finds a document by its `_id`

### countDocuments

```ts
async countDocuments(filter?: FilterQuery<T>): Promise<number>
```

- Counts documents matching filter

### update

```ts
async update(
  filter: FilterQuery<T>,
  updateDto: UpdateQuery<T>
): Promise<{ dataBefore: T | null; dataAfter: T | null }>
```

- Updates a document and returns both previous and merged result (not saved result)

### updateOrCreate

```ts
async updateOrCreate(
  filter: FilterQuery<T>,
  updateDto: UpdateQuery<T>
): Promise<{ dataBefore: T | null; dataAfter: T | null }>
```

- Updates if found, otherwise creates a new document

### delete

```ts
async delete(filter: FilterQuery<T>): Promise<T | null>
```

- Deletes a single document matching filter

---

## 📚 Utility: `convertPopulateString()`

```ts
private convertPopulateString(populateStr: string): PopulateOption[]
```

- Converts flat populate string into deeply nested `PopulateOption[]` structure
- Supports syntax like: `user.profile avatar:src` → `{ path: 'user', populate: [{ path: 'profile' }, { path: 'avatar', select: 'src' }] }`

---

## 📌 Notes

- You can inherit `BaseService<T>` in your own domain services to reuse common logic
- `ResultDto` in `findAll()` allows you to map results to DTOs via the `map()` option
- Fully supports `mongoose` native population and sessions

---

## 🧪 Example Usage

```ts
@Injectable()
export class UserService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }
}
```

---

## 🧩 Dependencies

- `mongoose`
- `@nestjs/common`
- TypeScript generics, DTOs from `./base-service.dto`
