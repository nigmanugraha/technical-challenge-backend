import Joi from '@hapi/joi';
import { JoiHelper } from 'src/@shared/joi-helper/joi-helper';

export const SendMessageValidationSchema = Joi.object({
  receiverId: JoiHelper.ObjectIdScm(true),
  content: JoiHelper.StringScm(true),
});

export const ViewMessagesValidationSchema = Joi.object({
  targetId: JoiHelper.ObjectIdScm(true),
});
