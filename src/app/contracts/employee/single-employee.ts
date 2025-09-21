import { ListImageFile } from "../list-image-file";
import { TypeOfBlood } from "../typeOfBlood";
import { LicenseTypes } from "../licenseTypes";
import { OperatorLicense } from "../operatorLicense";

export class SingleEmployee {
    id:string;
    firstName:string;
    lastName:string;
    departmentName:string;
    departmentId:string;
    jobName:string;
    jobId:string;
    quarryName:string;
    quarryId:string;
    birthDate:Date;
    phone:string;
    address:string;
    hireDate:Date;
    departureDate:Date;
    licenseType?:LicenseTypes;
    operatorLicense?:OperatorLicense;
    typeOfBlood?:TypeOfBlood;
    emergencyContact:string;
    employeeFiles:ListImageFile[];
    puantajDurumu:Map<string,boolean>;

}

