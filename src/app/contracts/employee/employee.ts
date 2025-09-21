import { TypeOfBlood } from "../typeOfBlood";
import { LicenseTypes } from "../licenseTypes";
import { OperatorLicense } from "../operatorLicense";

export class Employee {
    
    id:string;
    firstName: string;
    lastName: string;
    jobName: string;
    departmentName: string;
    quarryName: string;
    typeOfBlood?: TypeOfBlood;
    birthDate: Date;
    phone: string;
    address: string;
    hireDate: Date;
    departureDate: Date;
    licenseType?: LicenseTypes;
    operatorLicense?: OperatorLicense;
    emergencyContact: string;
    
}