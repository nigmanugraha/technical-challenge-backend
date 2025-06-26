import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectSchema } from '@hapi/joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'custom') {
      return value;
    }

    const { error } = this.schema.validate(value);
    if (error) {
      if (error.details) {
        throw new BadRequestException(error.details[0].message);
      }
      throw new BadRequestException(error.message);
    }
    return value;
  }
}
