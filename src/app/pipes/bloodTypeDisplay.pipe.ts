import { Pipe, PipeTransform } from '@angular/core';
import { TypeOfBlood } from '../contracts/typeOfBlood';

@Pipe({
  name: 'bloodTypeDisplay',
  standalone: true,
})
export class BloodTypeDisplayPipe implements PipeTransform {

  transform(bloodType: TypeOfBlood): any {
    switch (bloodType) {
      case TypeOfBlood.APositive:
        return "A+";
      case TypeOfBlood.ANegative:
        return "A-";
      case TypeOfBlood.BPositive:
        return "B+";
      case TypeOfBlood.BNegative:
        return "B-";
      case TypeOfBlood.ABPositive:
        return "AB+";
      case TypeOfBlood.ABNegative:
        return "AB-";
      case TypeOfBlood.OPositive:
        return "O+";
      case TypeOfBlood.ONegative:
        return "O-";

       default: bloodType;
      
      // ... other cases
    }
  }
}
