import {
  Component,
  ElementRef,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
import { Department } from 'src/app/contracts/department/department';
import { DepartmentService } from 'src/app/services/common/models/department.service';
import { LicenseTypes } from 'src/app/contracts/licenseTypes';
import { OperatorLicense } from 'src/app/contracts/operatorLicense';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { ListDepartment } from 'src/app/contracts/department/listDepartment';
import {
  FileUploadComponent,
  FileUploadOptions,
} from 'src/app/services/common/file-upload/file-upload.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ListImageFile } from 'src/app/contracts/list-image-file';
import { DialogService } from 'src/app/services/common/dialog.service';
import { EmployeFileDialogComponent } from 'src/app/dialogs/employee-dialogs/employe-file-dialog/employe-file-dialog.component';
import { EmployePhotoDialogComponent } from 'src/app/dialogs/employee-dialogs/employe-photo-dialog/employe-photo-dialog.component';

declare var $: any;

@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BloodTypeDisplayPipe,
    MatDialogModule,
  ],
  templateUrl: './employee-page.component.html',
  styleUrls: ['./employee-page.component.scss', '../../../../../styles.scss'],
})
export class EmployeePageComponent extends BaseComponent implements OnInit {
  @ViewChild('pdfContent') pdfContent: ElementRef;

  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };
  employee: SingleEmployee;
  listDepatment: GetListResponse<ListDepartment>;
  departments: ListDepartment[] = [];
  jobs: Job[] = [];
  quarries: Quarry[] = [];
  employeeForm: FormGroup;
  employeeImages: ListImageFile;

  // Kan grubu seçenekleri
  bloodTypeOptions = [
    { key: TypeOfBlood.None, display: 'Seçiniz' },
    { key: TypeOfBlood.APositive, display: 'A Rh+' },
    { key: TypeOfBlood.ANegative, display: 'A Rh-' },
    { key: TypeOfBlood.BPositive, display: 'B Rh+' },
    { key: TypeOfBlood.BNegative, display: 'B Rh-' },
    { key: TypeOfBlood.ABPositive, display: 'AB Rh+' },
    { key: TypeOfBlood.ABNegative, display: 'AB Rh-' },
    { key: TypeOfBlood.OPositive, display: 'O Rh+' },
    { key: TypeOfBlood.ONegative, display: 'O Rh-' },
  ];

  // Ehliyet tipi seçenekleri
  licenseTypeOptions = [
    { key: LicenseTypes.None, display: 'Seçiniz' },
    { key: LicenseTypes.A1, display: 'A1 - Motosiklet (125cc\'ye kadar)' },
    { key: LicenseTypes.A2, display: 'A2 - Motosiklet (35kW\'a kadar)' },
    { key: LicenseTypes.A, display: 'A - Motosiklet (sınırsız)' },
    { key: LicenseTypes.B1, display: 'B1 - Hafif araç' },
    { key: LicenseTypes.B, display: 'B - Otomobil' },
    { key: LicenseTypes.BE, display: 'BE - Otomobil + römorkluk' },
    { key: LicenseTypes.C1, display: 'C1 - Orta kamyon (3.5-7.5 ton)' },
    { key: LicenseTypes.C1E, display: 'C1E - Orta kamyon + römorkluk' },
    { key: LicenseTypes.C, display: 'C - Kamyon (7.5 ton üzeri)' },
    { key: LicenseTypes.CE, display: 'CE - Kamyon + römorkluk' },
    { key: LicenseTypes.D1, display: 'D1 - Küçük otobüs (16 kişiye kadar)' },
    { key: LicenseTypes.D1E, display: 'D1E - Küçük otobüs + römorkluk' },
    { key: LicenseTypes.D, display: 'D - Otobüs (16 kişi üzeri)' },
    { key: LicenseTypes.DE, display: 'DE - Otobüs + römorkluk' },
    { key: LicenseTypes.F, display: 'F - Traktör' },
    { key: LicenseTypes.G, display: 'G - İş makinesi' },
    { key: LicenseTypes.M, display: 'M - Moped' }
  ];

  // Operatör lisans seçenekleri
  operatorLicenseOptions = [
    { key: OperatorLicense.None, display: 'Seçiniz' },
    { key: OperatorLicense.Loader, display: 'Yükleyici' },
    { key: OperatorLicense.Excavator, display: 'Ekskavatör' },
    { key: OperatorLicense.LoaderAndExcavator, display: 'Yükleyici + Ekskavatör' },
    { key: OperatorLicense.Drill, display: 'Delici' }
  ];

  constructor(
    spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private quarryService: QuarryService,
    private departmentService: DepartmentService,
    private fB: FormBuilder,
    private dialogService: DialogService
  ) {
    super(spinner);

    this.employeeForm = this.fB.group({
      firstName: [''],
      lastName: [''],
      departmentName: [''],
      jobName: [''],
      quarryName: [''],
      birthDate: [''],
      departureDate: [''],
      emergencyContact: [''],
      hireDate: [''],
      licenseType: [null],
      operatorLicense: [null],
      phone: [''],
      typeOfBlood: [null],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const employeeId = params.get('employeeId');
      if (employeeId) {
        this.loadEmployeeDetails(employeeId);
        this.getEmployeePhoto(employeeId);
      }
    });
    this.getJobs();
    this.getQuarries();
  }

  loadEmployeeDetails(employeeId: string) {
    this.employeeService
      .getEmployeeById(employeeId, () => {})
      .then((response) => {
        this.employee = response;
        
        console.log('Employee data loaded:', this.employee);
        console.log('Employee typeOfBlood:', this.employee.typeOfBlood, typeof this.employee.typeOfBlood);
        console.log('Employee licenseType:', this.employee.licenseType, typeof this.employee.licenseType);

        this.employeeForm.patchValue({
          firstName: this.employee.firstName,
          lastName: this.employee.lastName,
          departmentName: this.employee.departmentName,
          jobName: this.employee.jobName,
          quarryName: this.employee.quarryName,
          birthDate: this.formatDate(this.employee.birthDate),
          departureDate: this.formatDate(this.employee.departureDate),
          emergencyContact: this.employee.emergencyContact,
          hireDate: this.formatDate(this.employee.hireDate),
          licenseType: this.employee.licenseType,
          operatorLicense: this.employee.operatorLicense,
          phone: this.employee.phone,
          typeOfBlood: this.employee.typeOfBlood,
          address: this.employee.address,
        });
        
        console.log('Form patched values:', this.employeeForm.value);
      });
  }

  async updateEmployee(formValue: any) {
    const update_employee: SingleEmployee = {
      id: this.employee.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      departmentName: this.employee.departmentName,
      jobName: formValue.jobName,
      quarryName: formValue.quarryName,
      birthDate: new Date(this.employeeForm.value.birthDate),
      departureDate: new Date(this.employeeForm.value.departureDate),
      emergencyContact: formValue.emergencyContact,
      employeeFiles: this.employee.employeeFiles,
      address: formValue.address,
      hireDate: new Date(this.employeeForm.value.hireDate),
      licenseType: formValue.licenseType && Number(formValue.licenseType) !== 0 ? Number(formValue.licenseType) : null,
      operatorLicense: formValue.operatorLicense && Number(formValue.operatorLicense) !== 0 ? Number(formValue.operatorLicense) : null,
      phone: formValue.phone,
      typeOfBlood: formValue.typeOfBlood && Number(formValue.typeOfBlood) !== 0 ? Number(formValue.typeOfBlood) : null,
      departmentId: this.getIdFromItems(
        this.departments,
        formValue.departmentName
      ),
      jobId: this.getIdFromItems(this.jobs, formValue.jobName),
      quarryId: this.getIdFromItems(this.quarries, formValue.quarryName),
      puantajDurumu: this.employee.puantajDurumu,
    };

    console.log('Update edilecek veri:', update_employee);
    console.log('LicenseType:', typeof update_employee.licenseType, update_employee.licenseType);
    console.log('TypeOfBlood:', typeof update_employee.typeOfBlood, update_employee.typeOfBlood);

    await this.employeeService.update(
      update_employee,
      () => {
        this.loadEmployeeDetails(this.employee.id);
        this.toastr.success('Çalışan başarıyla güncellendi.');
      },
      (errorMessage: string) => {
        this.toastr.error('Güncelleme başarısız: ' + errorMessage);
        console.error('Update hatası:', errorMessage);
      }
    );
  }

  private getIdFromItems(items: any[], value: string): string | null {
    const item = items.find((item) => item.name === value);
    return item ? item.id : null;
  }

  async getJobs() {
    await this.jobService
      .list(
        this.pageRequest.pageIndex,
        this.pageRequest.pageSize,
        () => {},
        (errorMessage: string) => {}
      )
      .then((response) => {
        this.jobs = response.items;
      });
  }

  async getQuarries() {
    await this.quarryService
      .list(
        this.pageRequest.pageIndex,
        this.pageRequest.pageSize,
        () => {},
        (errorMessage: string) => {}
      )
      .then((response) => {
        this.quarries = response.items;
      });
  }

  // Düzgün ve temiz PDF oluşturma fonksiyonu
  // Employee Page Component'te bu helper method'ları ekleyin ve generatePDF'i güncelleyin

  // ⭐ Helper method: Fotoğraf boyutlarını hesaplama
  private async calculateImageDimensions(
    base64Image: string
  ): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const tempImg = new Image();

      tempImg.onload = () => {
        resolve({
          width: tempImg.width,
          height: tempImg.height,
        });
      };

      tempImg.onerror = () => {
        console.error('❌ Image dimensions calculation failed');
        resolve(null);
      };

      // Timeout ekle
      setTimeout(() => {
        console.warn('⏰ Image loading timeout');
        resolve(null);
      }, 3000);

      tempImg.src = base64Image;
    });
  }

  // ⭐ Helper method: Aspect ratio koruyan boyut hesaplama
  private calculateFitDimensions(
    originalWidth: number,
    originalHeight: number,
    containerWidth: number,
    containerHeight: number
  ): { width: number; height: number; x: number; y: number } {
    const aspectRatio = originalWidth / originalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let finalWidth = containerWidth;
    let finalHeight = containerHeight;

    if (aspectRatio > containerAspectRatio) {
      // Fotoğraf daha geniş - genişliğe göre sığdır
      finalHeight = containerWidth / aspectRatio;
    } else {
      // Fotoğraf daha dar - yüksekliğe göre sığdır
      finalWidth = containerHeight * aspectRatio;
    }

    // Merkeze hizala
    const x = (containerWidth - finalWidth) / 2;
    const y = (containerHeight - finalHeight) / 2;

    return {
      width: finalWidth,
      height: finalHeight,
      x: x,
      y: y,
    };
  }

  // ⭐ Güncellenmiş generatePDF method'u
  // generatePDF metodunun güncellenmiş versiyonu
// generatePDF metodunun güncellenmiş versiyonu
async generatePDF() {
  const isConfirmed = window.confirm(
    'Personel bilgi formunu PDF olarak indirmek istediğinize emin misiniz?'
  );

  if (!isConfirmed) return;

  try {
    this.showSpinner(SpinnerType.BallSpinClockwise);

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ⭐ TÜRKÇE DESTEKLI PROFESYONEL FONT AYARLARI
    // Inter font base64 string'i ekleyin (örnekte kısaltılmış)
    const interFontBase64 = `ADD_INTER_FONT_BASE64_HERE`; // Bu kısmı Inter font base64 ile değiştirin
    
    // Alternatif olarak mevcut OpenSans fontunu kullan (zaten Türkçe destekli)
    doc.addFileToVFS('OpenSans-VariableFont_wdth,wght.ttf', openSansBase64);
    doc.addFont('OpenSans-VariableFont_wdth,wght.ttf', 'OpenSans', 'normal');
    doc.addFont('OpenSans-VariableFont_wdth,wght.ttf', 'OpenSans', 'bold');
    doc.setFont('OpenSans', 'normal');
    
    // **HEADER SECTION - Koyu mavi arka plan**
    doc.setFillColor(41, 128, 185); // Daha koyu profesyonel mavi
    doc.rect(0, 15, pageWidth, 35, 'F');

    // **FORM TITLE**
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('OpenSans', 'bold');
    doc.text('Personel Bilgi Formu', 20, 35);

    // **COMPANY LOGO/NAME AREA**
    doc.setFillColor(52, 152, 219); // Açık mavi ton
    doc.rect(pageWidth - 80, 20, 70, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('OpenSans', 'bold');
    doc.text('FIRMA ADI', pageWidth - 75, 30);

    let currentY = 65;

    // **PHOTO SECTION - Sağ tarafta**
    const photoWidth = 45;
    const photoHeight = 55;
    const photoX = pageWidth - photoWidth - 20;
    const photoY = currentY;

    // Fotoğraf çerçevesi - daha modern görünüm
    doc.setFillColor(248, 249, 250);
    doc.rect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4, 'F');
    doc.setDrawColor(108, 117, 125);
    doc.setLineWidth(0.8);
    doc.rect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4, 'S');

    // ⭐ Fotoğraf yükleme - aynı mantık
    if (this.employee?.id) {
      try {
        console.log('🔄 Fotoğraf yükleniyor, Employee ID:', this.employee.id);

        const photoData = await this.employeeService.getEmployeePhotoBase64(
          this.employee.id
        );

        if (photoData && photoData.base64 && photoData.success) {
          console.log('✅ Fotoğraf base64 alındı, boyut hesaplanıyor...');

          const imageFormat = photoData.mimeType.includes('png')
            ? 'PNG'
            : 'JPEG';
          const base64Image = `data:${photoData.mimeType};base64,${photoData.base64}`;

          const dimensions = await this.calculateImageDimensions(base64Image);

          if (dimensions) {
            console.log('📐 Orijinal boyutlar:', dimensions);

            const fitDimensions = this.calculateFitDimensions(
              dimensions.width,
              dimensions.height,
              photoWidth,
              photoHeight
            );

            console.log('📏 Hesaplanan fit boyutları:', fitDimensions);

            doc.addImage(
              base64Image,
              imageFormat,
              photoX + fitDimensions.x,
              photoY + fitDimensions.y,
              fitDimensions.width,
              fitDimensions.height
            );

            console.log(
              "✅ Fotoğraf başarıyla PDF'e eklendi (aspect ratio korundu)"
            );
            this.toastr.success("Fotoğraf PDF'e dahil edildi", '', {
              timeOut: 2000,
            });
          } else {
            console.warn(
              '❌ Fotoğraf boyutları hesaplanamadı, placeholder kullanılıyor'
            );
            this.addPhotoPlaceholder(
              doc,
              photoX,
              photoY,
              photoWidth,
              photoHeight
            );
          }
        } else {
          console.log('❌ Fotoğraf verisi alınamadı');
          this.addPhotoPlaceholder(
            doc,
            photoX,
            photoY,
            photoWidth,
            photoHeight
          );
        }
      } catch (error) {
        console.error('❌ Fotoğraf işleme hatası:', error);
        this.addPhotoPlaceholder(
          doc,
          photoX,
          photoY,
          photoWidth,
          photoHeight
        );
      }
    } else {
      console.log('❌ Employee ID bulunamadı');
      this.addPhotoPlaceholder(doc, photoX, photoY, photoWidth, photoHeight);
    }

    // **MAIN INFO BOX DATA - Sol gri kutu için autoTable**
    const mainInfoData = [
      [
        'Adı Soyadı',
        `${this.employee.firstName || ''} ${this.employee.lastName || ''}`,
      ],
      ['TC Kimlik No', this.employee.id?.substring(0, 11) || '12345678901'],
      [
        'Doğum Tarihi',
        this.formatDisplayDate(this.employee.birthDate) || '-',
      ],
      ['Görevi', this.employee.jobName || '-'],
    ];

    // Sol gri kutu - modern görünüm
    doc.setFillColor(241, 243, 244);
    const infoBoxWidth = 110;
    const infoBoxHeight = 55;
    const infoBoxX = 20;
    doc.rect(infoBoxX, currentY, infoBoxWidth, infoBoxHeight, 'F');
    doc.setDrawColor(173, 181, 189);
    doc.setLineWidth(0.5);
    doc.rect(infoBoxX, currentY, infoBoxWidth, infoBoxHeight, 'S');

    // ⭐ autoTable ile sol kutu içeriği - OPENSANS FONT
    autoTable(doc, {
      startY: currentY + 5,
      body: mainInfoData,
      theme: 'plain',
      styles: {
        font: 'OpenSans', // Türkçe destekli profesyonel font
        fontSize: 10,
        cellPadding: 2,
        textColor: [33, 37, 41], // Koyu gri
      },
      columnStyles: {
        0: {
          cellWidth: 30,
          fontStyle: 'bold',
          textColor: [0, 0, 0], // Tam siyah
          valign: 'middle',
          halign: 'left',
          fontSize: 11, // Biraz daha büyük
        },
        1: {
          cellWidth: 70,
          textColor: [73, 80, 87],
          valign: 'middle',
          halign: 'left',
          fontStyle: 'normal',
        },
      },
      margin: { left: infoBoxX + 5, right: 0 },
      tableWidth: infoBoxWidth - 10,
      showHead: false,
    });

    // Fotoğraf alanının bittiği yerden devam et
    currentY = Math.max(
      currentY + infoBoxHeight + 15,
      photoY + photoHeight + 10
    );

    // ⭐ Detaylı bilgiler için autoTable - ADRES DÜZELTMESİ İLE
    const detailInfoData = [
      [' ', ' ', ' ', ' '],
      
      [
        'Doğum Tarihi:',
        this.formatDisplayDate(this.employee.birthDate) || '-',
        'Cep Telefon:',
        this.employee.phone || '-',
      ],
      //['Doğum Yeri:', '-', 'Ev Telefonu:', '-'],
      ['İşe Giriş Tarihi:', this.formatDisplayDate(this.employee.hireDate) || '-', 'Ehliyet Tipi:', this.getLicenseTypeDisplay(this.employee.licenseType) || '-'],
      ['Departman:', this.employee.departmentName || '-','Kan Grubu:',this.getBloodTypeDisplay(this.employee.typeOfBlood?.toString()) || '-'],
      // Operatör lisansı sadece operatör ise göster
      ...(this.isOperatorJob() && this.employee.operatorLicense ? [['Operatör Lisansı:', this.getOperatorLicenseDisplay(this.employee.operatorLicense), '', '']] : []),
      ['Acil Durum İletişim:', this.employee.emergencyContact || '-'],
      // ⭐ ADRES İÇİN AYRI SATIR - TAM GÖRÜNÜR
      [
        'Adres:',
        this.employee.address || '-',
        '',
        '',
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      body: detailInfoData,
      theme: 'plain',
      styles: {
        font: 'OpenSans', // Türkçe destekli profesyonel font
        fontSize: 10,
        cellPadding: 3,
        textColor: [33, 37, 41],
        valign: 'middle',
        halign: 'left',
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          cellWidth: 40, // Biraz genişlettik
          fontSize: 11, // Başlık için büyük font
          textColor: [0, 0, 0], // Tam siyah
        },
        1: {
          cellWidth: 55, // Genişlettik
          fontSize: 10,
          textColor: [73, 80, 87],
          fontStyle: 'normal',
        },
        2: {
          fontStyle: 'bold',
          cellWidth: 40,
          fontSize: 11, // Başlık için büyük font
          textColor: [0, 0, 0], // Tam siyah
        },
        3: {
          cellWidth: 55,
          fontSize: 10,
          textColor: [73, 80, 87],
          fontStyle: 'normal',
        },
      },
      // ⭐ Adres satırında özel davranış
      willDrawCell: function (data) {
        // Adres satırı (5. satır, index 5) için özel işlem
        if (data.row.index === 5 && data.column.index === 1) {
          // Adres çok uzunsa çok satırlı yap
          const address = data.cell.raw as string;
          if (address && address.length > 50) {
            const words = address.split(' ');
            const lines = [];
            let currentLine = '';
            
            words.forEach(word => {
              if ((currentLine + word).length > 45) {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
              } else {
                currentLine += word + ' ';
              }
            });
            
            if (currentLine.trim()) {
              lines.push(currentLine.trim());
            }
            
            // İlk satırı yazdır
            data.cell.text = [lines[0] || address];
            
            // Eğer birden fazla satır varsa, altına ekle
            if (lines.length > 1) {
              const doc = data.doc;
              const remainingText = lines.slice(1).join('\n');
              
              doc.setFont('OpenSans', 'normal');
              doc.setFontSize(9);
              doc.setTextColor(73, 80, 87);
              
              const textLines = doc.splitTextToSize(remainingText, data.cell.width - 6);
              let yPos = data.cell.y + data.cell.height - 2;
              
              textLines.forEach((line: string, index: number) => {
                if (index < 2) { // Maksimum 2 ek satır
                  doc.text(line, data.cell.x + 3, yPos);
                  yPos += 4;
                }
              });
            }
          }
        }
        return true;
      },
      margin: { left: 20, right: 20 },
    });

    // Tablo sonrası Y pozisyonu
    const finalY = (doc as any).lastAutoTable.finalY || currentY + 80;

    // **FOOTER - Modern tasarım**
    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125); // Bootstrap secondary color
    const currentDate = new Date().toLocaleDateString('tr-TR');
    doc.text(`Düzenleme Tarihi: ${currentDate}`, 20, pageHeight - 10);
    doc.text('Sayfa 1/1', pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    // PDF'i yeni sekmede aç
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    this.toastr.success('PDF başarıyla oluşturuldu!');
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    this.toastr.error('PDF oluşturulurken bir hata oluştu.');
  } finally {
    this.hideSpinner(SpinnerType.BallSpinClockwise);
  }
}

// Güncellenmiş placeholder method'u - OpenSans font ile
private addPhotoPlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
) {
  doc.setFont('OpenSans', 'normal');
  doc.setTextColor(108, 117, 125);
  doc.setFontSize(8);
  doc.text('FOTOĞRAF', x + width / 2, y + height / 2 - 2, {
    align: 'center',
  });
  doc.text('YOK', x + width / 2, y + height / 2 + 4, { align: 'center' });
}

  // Güvenli fotoğraf yükleme fonksiyonu
  private async getImageAsBase64Safe(imageUrl: string): Promise<string | null> {
    try {
      // CORS sorunlarını önlemek için alternatif yöntemler

      // Yöntem 1: Doğrudan fetch (eğer CORS izni varsa)
      try {
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          return await this.blobToBase64(blob);
        }
      } catch (corsError) {
        console.warn('CORS fetch başarısız, alternatif yöntem deneniyor...');
      }

      // Yöntem 2: Proxy URL kullanma (eğer mevcutsa)
      // const proxyUrl = `api/proxy-image?url=${encodeURIComponent(imageUrl)}`;

      // Yöntem 3: Canvas kullanarak (sadece same-origin için)
      return await this.getImageViaCanvas(imageUrl);
    } catch (error) {
      console.error('Fotoğraf yüklenirken hata:', error);
      return null;
    }
  }

  // Canvas kullanarak fotoğraf yükleme
  private async getImageViaCanvas(imageUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // CORS denemesi

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = img.width;
          canvas.height = img.height;

          ctx?.drawImage(img, 0, 0);

          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        } catch (error) {
          console.warn('Canvas çizimi başarısız:', error);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.warn('Fotoğraf yüklenemedi:', imageUrl);
        resolve(null);
      };

      img.src = imageUrl;

      // Timeout ekle
      setTimeout(() => resolve(null), 5000);
    });
  }

  // Blob'u Base64'e çevirme
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Kan grubu display helper fonksiyonu
  getBloodTypeDisplay(bloodType: string): string {
    if (!bloodType) return '';

    const bloodTypeMap: { [key: string]: string } = {
      APositive: 'A Rh+',
      ANegative: 'A Rh-',
      BPositive: 'B Rh+',
      BNegative: 'B Rh-',
      ABPositive: 'AB Rh+',
      ABNegative: 'AB Rh-',
      OPositive: 'O Rh+',
      ONegative: 'O Rh-',
      '1': 'A Rh+',
      '2': 'A Rh-',
      '3': 'B Rh+',
      '4': 'B Rh-',
      '5': 'AB Rh+',
      '6': 'AB Rh-',
      '7': 'O Rh+',
      '8': 'O Rh-',
    };
    return bloodTypeMap[bloodType] || bloodType;
  }

  formatDate(date: Date | string): string {
    if (!date) return null;

    const newDate = new Date(date);
    const year = newDate.getUTCFullYear();
    const month = `${newDate.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${newDate.getUTCDate() + 1}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Gösterim için tarih formatı
  formatDisplayDate(date: Date | string): string {
    if (!date) return '';

    try {
      const newDate = new Date(date);
      return newDate.toLocaleDateString('tr-TR');
    } catch (error) {
      return '';
    }
  }

  selectedFiles: FileList = null;

  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
  }

  uploadFile(): void {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this.toastr.error('Lütfen bir profil fotoğrafı seçin.');
      return;
    }

    const folderPath = `${this.employee.firstName}${this.employee.lastName}`;
    const category = 'employee-images/photo';

    const employeeId = this.employee.id;
    if (!employeeId) {
      this.toastr.error('Çalışan ID bilgisi bulunamadı.');
      return;
    }

    const profilePhoto = this.selectedFiles[0];

    this.employeeService.uploadImageForEmployee(
      category,
      employeeId,
      folderPath,
      profilePhoto,
      () => {
        this.toastr.success('Profil fotoğrafı başarıyla yüklendi.');
        this.getEmployeePhoto(this.employee.id);
      },
      (errorMessage: string) => {
        this.toastr.error(
          `Profil fotoğrafı yükleme başarısız: ${errorMessage}`
        );
      }
    );
  }

  getEmployeePhoto(employeeId: string): void {
    this.employeeService
      .getEmployeePhoto(employeeId, () => {})
      .then((response) => {
        this.employeeImages = response;
      });
  }

  addEmployeeFiles(employeeId: string): void {
    this.dialogService.openDialog({
      componentType: EmployeFileDialogComponent,
      data: employeeId,
      options: { width: '1000px', height: '500px' },
      afterClosed: () => {
        this.loadEmployeeDetails(employeeId);
      },
    });
  }

  addEmployeePhoto(employeeId: string): void {
    this.dialogService.openDialog({
      componentType: EmployePhotoDialogComponent,
      data: employeeId,
      options: { width: '500px', height: '500px' },
      afterClosed: () => {
        this.getEmployeePhoto(employeeId);
      },
    });
  }

  goToEmployeFiles(employeeId: string): void {
    this.router.navigate([
      'personeller/personel/personel-dosyalar/',
      employeeId,
    ]);
  }

  goBack() {
    if (this.employee && this.employee.id) {
      this.router.navigate([`/personeller`]);
    } else {
      this.router.navigate(['/personeller']);
    }
  }

  // Ehliyet tipi display helper
  getLicenseTypeDisplay(licenseType: LicenseTypes): string {
    if (!licenseType && licenseType !== 0) return '';
    
    const licenseTypeMap: { [key: number]: string } = {
      [LicenseTypes.None]: 'Seçiniz',
      [LicenseTypes.A1]: 'A1 - Motosiklet (125cc\'ye kadar)',
      [LicenseTypes.A2]: 'A2 - Motosiklet (35kW\'a kadar)',
      [LicenseTypes.A]: 'A - Motosiklet (sınırsız)',
      [LicenseTypes.B1]: 'B1 - Hafif araç',
      [LicenseTypes.B]: 'B - Otomobil',
      [LicenseTypes.BE]: 'BE - Otomobil + römorkluk',
      [LicenseTypes.C1]: 'C1 - Orta kamyon (3.5-7.5 ton)',
      [LicenseTypes.C1E]: 'C1E - Orta kamyon + römorkluk',
      [LicenseTypes.C]: 'C - Kamyon (7.5 ton üzeri)',
      [LicenseTypes.CE]: 'CE - Kamyon + römorkluk',
      [LicenseTypes.D1]: 'D1 - Küçük otobüs (16 kişiye kadar)',
      [LicenseTypes.D1E]: 'D1E - Küçük otobüs + römorkluk',
      [LicenseTypes.D]: 'D - Otobüs (16 kişi üzeri)',
      [LicenseTypes.DE]: 'DE - Otobüs + römorkluk',
      [LicenseTypes.F]: 'F - Traktör',
      [LicenseTypes.G]: 'G - İş makinesi',
      [LicenseTypes.M]: 'M - Moped'
    };
    
    return licenseTypeMap[licenseType] || `${licenseType}`;
  }

  // Operatör lisans display helper
  getOperatorLicenseDisplay(operatorLicense: OperatorLicense): string {
    if (!operatorLicense && operatorLicense !== 0) return '';
    
    const operatorLicenseMap: { [key: number]: string } = {
      [OperatorLicense.None]: 'Seçiniz',
      [OperatorLicense.Loader]: 'Yükleyici',
      [OperatorLicense.Excavator]: 'Ekskavatör',
      [OperatorLicense.LoaderAndExcavator]: 'Yükleyici + Ekskavatör',
      [OperatorLicense.Drill]: 'Delici'
    };
    
    return operatorLicenseMap[operatorLicense] || `${operatorLicense}`;
  }

  // Operatör olup olmadığını kontrol et
  isOperatorJob(): boolean {
    if (!this.employee?.jobName) return false;
    
    const jobName = this.employee.jobName.toLowerCase();
    return jobName.includes('operatör') || 
           jobName.includes('operator') ||
           jobName.includes('makinist');
  }

  // Kan grubu display helper
  getTypeOfBloodDisplay(typeOfBlood: TypeOfBlood): string {
    if (!typeOfBlood && typeOfBlood !== 0) return '';
    
    const typeOfBloodMap: { [key: number]: string } = {
      [TypeOfBlood.None]: 'Seçiniz',
      [TypeOfBlood.APositive]: 'A Rh+',
      [TypeOfBlood.ANegative]: 'A Rh-',
      [TypeOfBlood.BPositive]: 'B Rh+',
      [TypeOfBlood.BNegative]: 'B Rh-',
      [TypeOfBlood.ABPositive]: 'AB Rh+',
      [TypeOfBlood.ABNegative]: 'AB Rh-',
      [TypeOfBlood.OPositive]: 'O Rh+',
      [TypeOfBlood.ONegative]: 'O Rh-'
    };
    
    return typeOfBloodMap[typeOfBlood] || `${typeOfBlood}`;
  }
}
