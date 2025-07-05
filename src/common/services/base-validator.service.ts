import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseValidatorService {
  throwValidationError(errors: string[], errorCode: number = 400, message: string = '') {
    throw {
      errorCode: 400,
      message: 'Validation Failed',
      data: null,
      errors,
    };
  }
}
