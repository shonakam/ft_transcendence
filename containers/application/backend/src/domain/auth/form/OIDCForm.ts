import { AuthCode } from '../vo/AuthCode.ts';

export interface OIDCForm {
  code: AuthCode;
}
