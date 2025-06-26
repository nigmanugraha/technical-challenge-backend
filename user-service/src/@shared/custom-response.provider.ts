export interface CustomResponse<T> {
  data: T;
  meta: {
    message?: string;
    status_code?: number;
    page?: number | string;
    per_page?: number | string;
    total_page?: number | string;
    total_data?: number | string;
  };
}

export class CreateDataResponse<T> implements CustomResponse<T> {
  meta: {
    message?: string;
    status_code?: number;
    page?: number | string;
    per_page?: number | string;
    total_page?: number | string;
    total_data?: number | string;
  } = {};
  data: T;
  constructor(data: T, meta?: CustomResponse<T>['meta']) {
    this.data = data;
    this.meta = {
      ...meta,
      message: (meta && meta.message) || 'Data was successfully created!',
      status_code: 201,
    };
  }
}

export class UpdateDataResponse<T> implements CustomResponse<T> {
  meta: {
    message: string;
    status_code: number;
    page?: number | string;
    per_page?: number | string;
    total_page?: number | string;
    total_data?: number | string;
  };
  data: T;
  constructor(data: T, meta?: CustomResponse<T>['meta']) {
    this.data = data;
    this.meta = {
      ...meta,
      message: (meta && meta.message) || 'Data was successfully updated!',
      status_code: 200,
    };
  }
}

export class DeleteDataResponse<T> implements CustomResponse<T> {
  meta: {
    message: string;
    status_code?: number;
    page?: number | string;
    per_page?: number | string;
    total_page?: number | string;
    total_data?: number | string;
  };
  data: T;
  constructor(data: T, meta?: CustomResponse<T>['meta']) {
    this.data = data;
    this.meta = {
      ...meta,
      message: (meta && meta.message) || 'Data was successfully deleted!',
      status_code: 200,
    };
  }
}

export class GetDataResponse<T> implements CustomResponse<T> {
  meta: {
    message: string;
    status_code: number;
    page?: number | string;
    per_page?: number | string;
    total_page?: number | string;
    total_data?: number | string;
  };
  data: T;
  constructor(data: T, meta?: CustomResponse<T>['meta']) {
    this.data = data;
    if (Array.isArray(data)) {
      this.meta = {
        ...meta,
        message: (meta && meta.message) || 'Data was successfully retrieved!',
        status_code: 200,
        total_data: (meta && meta.total_data) || data.length,
        page: (meta && Number(meta.page)) || 1,
        per_page: (meta && Number(meta.per_page)) || 10,
        total_page: Math.ceil(
          ((meta && Number(meta.total_data)) || 1) /
            (meta && meta.per_page ? Number(meta.per_page) : 10),
        ),
      };
    } else {
      this.meta = {
        ...meta,
        message: (meta && meta.message) || 'Data was successfully retrieved!',
        status_code: 200,
      };
    }
  }
}
