import Joi from '@hapi/joi';
import { JoiHelper } from 'src/@shared/joi-helper/joi-helper';

export const RegisterAuthValidationSchema = Joi.object({
  email: JoiHelper.EmailScm(true),
  username: JoiHelper.StringScm(true),
  password: JoiHelper.StringScm(true),
  secondPassword: JoiHelper.StringScm(true)
    .valid(Joi.ref('password'))
    .messages({
      'any.only': 'Second password must match password',
    }),
});

export const LoginAuthValidationSchema = Joi.object({
  email: JoiHelper.EmailScm(false),
  username: JoiHelper.StringScm(false),
  password: JoiHelper.StringScm(true),
})
  .or('email', 'username')
  .messages({
    'object.missing': 'Either email or username is required',
  });
