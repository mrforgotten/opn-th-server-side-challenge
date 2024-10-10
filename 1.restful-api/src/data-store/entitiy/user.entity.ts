import { Address } from '../type/address.type';
import { Gender } from '../type/gender.type';

export class User {
  id: number;
  email: string;
  name: string;
  dob: string | Date;
  gender: Gender;
  address: Address;
  isSubscribe: boolean;
}
