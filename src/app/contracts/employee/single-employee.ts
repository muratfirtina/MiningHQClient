export class SingleEmployee {
    id:string;
    firstName:string;
    lastName:string;
    jobName:string;
    quarryName:string;
    birthDate:Date;
    phone:string;
    address:string;
    hireDate:Date;
    departureDate:Date;
    licenseType:string;
    typeOfBlood:string;
    emergencyContact:string;

    constructor(){
        this.id = "";
        this.firstName = "";
        this.lastName = "";
        this.jobName = "";
        this.quarryName = "";
        this.birthDate = new Date();
        this.phone = "";
        this.address = "";
        this.hireDate = new Date();
        this.departureDate = new Date();
        this.licenseType = "";
        this.typeOfBlood = "";
        this.emergencyContact = "";
    }
}

