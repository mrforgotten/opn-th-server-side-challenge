import { Address } from '../type/address.type';
import { Gender } from '../type/gender.type';

export class UserStoreUpdateDto {
  email?: string;
  name?: string;
  dob?: string;
  gender?: Gender;
  address?: Address;
  isSubscribe?: boolean;
}
