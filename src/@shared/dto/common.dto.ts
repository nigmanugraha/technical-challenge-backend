import { UserDocument } from 'src/user/user.schema';

export class WithContext {
  ctx: UserAgent;
}

export class UserAgent {
  method: string;
  endpoint: string;
  user: UserDocument;
  userAgent: string;
  ipAddress: string;
  requestHeaders: any;
  requestParams: any;
  requestQuery: any;
  requestBody: any;
  device_info: {
    deviceType: string;
    os: string;
    browser: string;
    device: string;
    brandModel: string;
  };
}

export enum SortTypeEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export class CommonPaginationDto {
  per_page?: string;
  page?: string;
  sort_by?: string;
  sort?: SortTypeEnum;
}

export class VoidResponse {
  success: boolean;
  message: string;
}
