import Joi from '@hapi/joi';
import { JoiHelper } from 'src/@shared/joi-helper/joi-helper';

export const UserFileImageValidationSchema = Joi.object({
  img: Joi.binary()
    .custom((value, helpers) => {
      // Validate file size (1 MB limit)
      const maxFileSize = 1 * 1024 * 1024; // 10 MB
      if (value.length > maxFileSize) {
        return helpers.error('file.size');
      }

      // Extract the original name from the context (file object)
      const { originalname } = helpers.state.ancestors[0];

      // Validate file extension
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const fileExtension = originalname.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        return helpers.error('file.extension');
      }

      return value;
    })
    .optional()
    .messages({
      'file.size': 'File size exceeds the 1 MB limit.',
      'file.extension':
        'Invalid file extension. Allowed extensions: jpg, jpeg, png, gif, webp.',
    }),
});

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
