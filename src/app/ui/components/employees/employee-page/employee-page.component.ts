import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { JobService } from 'src/app/services/common/models/job.service';
import { Job } from 'src/app/contracts/job/job';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { openSansBase64 } from 'src/assets/fonts/openSansFont';
import { TypeOfBlood } from 'src/app/contracts/typeOfBlood';
import { BloodTypeDisplayPipe } from 'src/app/pipes/bloodTypeDisplay.pipe';

declare var $: any;

@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,ReactiveFormsModule, BloodTypeDisplayPipe],
  templateUrl: './employee-page.component.html',
  styleUrls: ['./employee-page.component.scss', '../../../../../styles.scss']
})
export class EmployeePageComponent extends BaseComponent implements OnInit {

  @ViewChild('pdfContent') pdfContent: ElementRef;
  
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };
  employee: SingleEmployee;
  jobs: Job[] = [];
  quarries: Quarry[] = [];
  employeeForm: FormGroup;
  typeOfBlood: TypeOfBlood[] = Object.values(TypeOfBlood).filter(value => typeof value === 'string').map(value => value as TypeOfBlood);
  
  
 

  constructor(
    spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private jobService: JobService,
    private quarryService: QuarryService,
    private fB: FormBuilder
  ) {
    super(spinner);

    this.employeeForm = this.fB.group({
      firstName: [''],
      lastName: [''],
      jobName: [''],
      quarryName: [''],
      birthDate: [''],
      departureDate: [''],
      emergencyContact: [''],
      hireDate: [''],
      licenseType: [''],
      phone: [''],
      typeOfBlood: [''],
      address: [''],
    });

    /* this.bloodTypeOptions = Object.entries(TypeOfBlood)
      .filter(([key, value]) => typeof value === 'number') // Filter to only include the enum members, not reverse mappings
      .map(([key, value]) => ({ name: key, value: value as TypeOfBlood })); */
  
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const employeeId = params.get('employeeId');
      if (employeeId) {
        this.loadEmployeeDetails(employeeId);
      }
    });
    this.getJobs();
    this.getQuarries();
    this.typeOfBlood
  }

  loadEmployeeDetails(employeeId: string) {
    this.employeeService.getEmployeeById(employeeId, () => {}).then((response) => {
      this.employee = response;

      const birthDateISO = this.employee.birthDate ?
        new Date(this.employee.birthDate).toISOString().substring(0, 10) :
        null;
      
      const hireDateISO = this.employee.hireDate ?
        new Date(this.employee.hireDate).toISOString().substring(0, 10) :
        null;
      
      const departureDateISO = this.employee.departureDate ?
        new Date(this.employee.departureDate).toISOString().substring(0, 10) :
        null;

      
      this.employeeForm = this.fB.group({
        firstName: [this.employee.firstName],
        lastName: [this.employee.lastName],
        jobName: [this.employee.jobName],
        quarryName: [this.employee.quarryName],
        birthDate: [birthDateISO],
        departureDate: [departureDateISO],
        emergencyContact: [this.employee.emergencyContact],
        hireDate: [hireDateISO],
        licenseType: [this.employee.licenseType],
        phone: [this.employee.phone],
        typeOfBlood: [this.employee.typeOfBlood],
        address: [this.employee.address],
      });
    });
  }

  async updateEmployee(formValue: any) {
    const update_employee: SingleEmployee = {
      id: this.employee.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      jobName: formValue.jobName,
      quarryName: formValue.quarryName,
      birthDate: new Date(formValue.birthDate),
      departureDate: new Date(formValue.departureDate),
      emergencyContact: formValue.emergencyContact,
      employeeImageFiles: this.employee.employeeImageFiles,
      address: formValue.address,
      hireDate: new Date(formValue.hireDate),
      licenseType: formValue.licenseType,
      phone: formValue.phone,
      typeOfBlood: formValue.typeOfBlood,
      jobId: this.getIdFromItems(this.jobs, formValue.jobName),
      quarryId: this.getIdFromItems(this.quarries, formValue.quarryName),
      puantajDurumu: this.employee.puantajDurumu,
      
    };

    await this.employeeService.update(update_employee, () => {
      this.loadEmployeeDetails(this.employee.id);
      this.toastr.success('Çalışan başarıyla güncellendi.');
    }, (errorMessage: string) => {
      this.toastr.error(errorMessage);
    });
  }

  private getIdFromItems(items: any[], value: string): string | null {
    const item = items.find(item => item.name === value);
    return item ? item.id : null;
  }

  async getJobs() {
    await this.jobService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
        this.jobs = response.items;
      });
  }


  async getQuarries() {
    await this.quarryService.list(this.pageRequest.pageIndex, this.pageRequest.pageSize, () => {}, (errorMessage: string) => {})
      .then((response) => {
        this.quarries = response.items;
      });
  }

  /* generatePDF() {
    const content = this.pdfContent.nativeElement;

    html2canvas(content).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('employee-details.pdf');
    });
  }
  printPage() {
    window.print();
  } */

  generatePDF() {
    const isConfirmed = window.confirm('Çalışan bilgilerini PDF olarak indirmek istediğinize emin misiniz?')
    if (isConfirmed) {
    
    let doc = new jsPDF();

    const birthDateISO = this.employee.birthDate ?
        new Date(this.employee.birthDate).toISOString().substring(0, 10) :
        null;
    const hireDateISO = this.employee.hireDate ?
        new Date(this.employee.hireDate).toISOString().substring(0, 10) :
        null;
    const departureDateISO = this.employee.departureDate ?
        new Date(this.employee.departureDate).toISOString().substring(0, 10) :
        null;

    const employeeData = {
      name: this.employee.firstName + ' ' + this.employee.lastName,
      job: this.employee.jobName,
      birthDate: birthDateISO,
      hireDate: hireDateISO,
      quarry: this.employee.quarryName,
      phone: this.employee.phone,
      address: this.employee.address,
      licenseType: this.employee.licenseType,
      typeOfBlood: this.employee.typeOfBlood,
      emergencyContact: this.employee.emergencyContact,
      departureDate: departureDateISO,
    };

    doc.addFileToVFS('OpenSans-VariableFont_wdth,wght.ttf', openSansBase64);
    doc.addFont('OpenSans-VariableFont_wdth,wght.ttf', 'openSansBase64', 'normal');

    autoTable(doc,{
      head: [[`${employeeData.name}`, '']],
      body: [
        ['Mesleği :', employeeData.job],
        ['Doğum Tarihi :', birthDateISO],
        ['İşe Giriş Tarihi :', hireDateISO],
        ['Şantiye :', employeeData.quarry],
        ['Telefon :', employeeData.phone],
        ['Adres :', employeeData.address],
        ['Ehliyet Tipi :', employeeData.licenseType],
        ['Kan Grubu :', employeeData.typeOfBlood],
        ['Acil Durumda İletişim :', employeeData.emergencyContact],
        ['İşten Ayrılış Tarihi :', departureDateISO],
      ],
      styles: {
        font: 'openSansBase64',
        fontSize: 10,
        fontStyle: 'normal',
      },
      headStyles: {
        font: 'openSansBase64',
        fontStyle: 'bold',
        fontSize: 14,
        halign: 'left',
        fillColor: [255, 193, 7],
        textColor: [0 , 0, 0], // Başlık yazı rengi (beyaz)
      },
      bodyStyles: {
        fillColor: [255, 255, 255], // Satır arkaplan rengi (beyaz)
      },
      theme: 'grid', // Tema seçimi (opsiyonel)
      // Diğer özelleştirmeler...
    })
    const pdfBlob = doc.output('blob');

    // Blob için bir URL oluştur
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Yeni sekmede PDF'i aç
    window.open(pdfUrl, '_blank');
    }
    else {
      return;
    }
  }
}
