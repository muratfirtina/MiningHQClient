import { Pipe, PipeTransform } from '@angular/core';
import { TypeOfBlood } from '../contracts/typeOfBlood';

@Pipe({
  name: 'bloodTypeDisplay',
  standalone: true
})
export class BloodTypeDisplayPipe implements PipeTransform {

  private bloodTypeMap: { [key: string]: string } = {
    'None': 'Belirtilmemiş',
    'APositive': 'A Rh+',
    'ANegative': 'A Rh-',
    'BPositive': 'B Rh+',
    'BNegative': 'B Rh-',
    'ABPositive': 'AB Rh+',
    'ABNegative': 'AB Rh-',
    'OPositive': 'O Rh+',
    'ONegative': 'O Rh-',
    // Sayısal değerler için de mapping (backward compatibility)
    '0': 'Belirtilmemiş',
    '1': 'A Rh+',
    '2': 'A Rh-',
    '3': 'B Rh+',
    '4': 'B Rh-',
    '5': 'AB Rh+',
    '6': 'AB Rh-',
    '7': 'O Rh+',
    '8': 'O Rh-'
  };

  transform(value: TypeOfBlood | string | number | any): string {
    if (!value && value !== 0) return '';
    
    // String olarak geliyorsa direkt kontrol et
    if (typeof value === 'string') {
      return this.bloodTypeMap[value] || value;
    }
    
    // Sayısal değer olarak geliyorsa
    if (typeof value === 'number') {
      return this.bloodTypeMap[value.toString()] || value.toString();
    }
    
    // Diğer durumlar için string'e çevir
    const stringValue = String(value);
    return this.bloodTypeMap[stringValue] || stringValue;
  }
}