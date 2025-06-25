# 🛡️ JoiHelper & JoiValidationPipe for NestJS

This module provides a centralized and reusable way to implement input validation in your NestJS application using [Joi](https://joi.dev/). It includes:

- `JoiHelper`: A factory class for generating standardized Joi schemas.
- `JoiValidationPipe`: A NestJS pipe that applies Joi validation on incoming request data.

---

## 📦 Installation

Ensure you have `@hapi/joi` installed:

```bash
yarn add @hapi/joi
```

Or using npm:

```bash
npm install @hapi/joi
```

---

## 🧱 JoiHelper — Reusable Validation Schemas

`JoiHelper` is a utility class that standardizes Joi schema definitions across your application.

### ✨ Features

- 📧 Email validation (`EmailScm`)
- 🔐 Generic string & password validation (`StringScm`)
- 🔢 Number and integer validation (`NumberScm`)
- 🎚 Enum validation (`EnumScm`)
- 🧮 Array with min/max constraints
- 🆔 MongoDB ObjectId and array of ObjectIds
- 📅 ISO date string (`DateStringScm`)
- ⚙️ Supports `required`, `min`, `max`, and more

### 📘 Example: Login Validation

```ts
import { JoiHelper } from 'src/@shared/joi-helper';
import Joi from '@hapi/joi';

export const LoginValidationSchema = Joi.object({
  email: JoiHelper.EmailScm(false),
  username: JoiHelper.StringScm(false),
  password: JoiHelper.StringScm(true),
})
  .or('email', 'username')
  .messages({
    'object.missing': 'Either email or username is required',
  });
```

---

## 🔄 JoiValidationPipe — Integrate Joi into NestJS

`JoiValidationPipe` allows you to validate incoming request bodies using any Joi schema.

> 📄 **File location**: `joi-helper/pipe/joi-validation.pipe.ts`

### 🛠 Implementation

```ts
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
```

---

### ✅ Controller Usage

```ts
import { Controller, Post, Body } from '@nestjs/common';
import { JoiValidationPipe } from 'src/@shared/joi-helper/pipe/joi-validation.pipe';
import { LoginValidationSchema } from './validation/login.schema';
import { LoginRequestDto } from './dto/login-request.dto';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(
    @Body(new JoiValidationPipe(LoginValidationSchema))
    body: LoginRequestDto,
  ) {
    return this.authService.login(body);
  }
}
```
