import { TypeOfBlood } from "../typeOfBlood";
import { LicenseTypes } from "../licenseTypes";
import { OperatorLicense } from "../operatorLicense";

export class CreateEmployee {
    firstName:string;
    lastName:string;
    jobName:string;
    jobId:string;
    quarryName:string;
    quarryId:string;
    birthDate:Date;
    phone:string;
    address:string;
    hireDate:Date;
    licenseType?:LicenseTypes;
    operatorLicense?:OperatorLicense;
    typeOfBlood?:TypeOfBlood;
    emergencyContact:string;
}