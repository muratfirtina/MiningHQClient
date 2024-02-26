import { ListImageFile } from "../list-image-file";
import { TypeOfBlood } from "../typeOfBlood";

export class SingleEmployee {
    id:string;
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
    departureDate:Date;
    licenseType:string;
    typeOfBlood:string;
    emergencyContact:string;
    employeeImageFiles:ListImageFile[];
    puantajDurumu:Map<string,boolean>;

}

