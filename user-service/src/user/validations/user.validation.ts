import Joi from '@hapi/joi';
import { JoiHelper } from 'src/@shared/joi-helper/joi-helper';

export const UserCreateProfileValidationSchema = Joi.object({
  name: JoiHelper.StringScm(true),
  birthday: JoiHelper.DateStringScm(true),
  height: JoiHelper.NumberScm(true, false, 0),
  weight: JoiHelper.NumberScm(true, false, 0),
  interests: JoiHelper.ArrayStringScm(true),
});

export const UserUpdateProfileValidationSchema = Joi.object({
  name: JoiHelper.StringScm(true),
  birthday: JoiHelper.DateStringScm(true),
  height: JoiHelper.NumberScm(true, false, 0),
  weight: JoiHelper.NumberScm(true, false, 0),
  interests: JoiHelper.ArrayStringScm(true),
});
