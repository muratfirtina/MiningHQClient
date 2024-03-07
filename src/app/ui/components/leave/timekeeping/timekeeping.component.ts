import { Component, OnInit } from '@angular/core';
import { CommonModule, Time } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CreateTimekeeping } from 'src/app/contracts/leave/createTimekeeping';
import { LeaveEntitledService } from 'src/app/services/common/models/leave-entitled.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { TimekeepingList } from 'src/app/contracts/leave/timekeepingList';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LeaveType } from 'src/app/contracts/leave/leaveType';
import { LeaveEntitledAdd } from 'src/app/contracts/leave/leaveEntitledAdd';
import { listLeaveType } from 'src/app/contracts/leave/listLeaveType';
import { TimekeepingStatus } from 'src/app/contracts/leave/timekeepingStatusEnum';

declare var bootstrap: any;


@Component({
  selector: 'app-timekeeping',
  standalone: true,
  imports: [CommonModule ,FormsModule,RouterModule],
  templateUrl: './timekeeping.component.html',
  styleUrls: ['./timekeeping.component.scss', '../../../../../styles.scss']
})
export class TimekeepingComponent implements OnInit {

  entitledLeaveForm: FormGroup;

  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  employeeList: GetListResponse<TimekeepingList>[] = [];
  items: TimekeepingList[] = [];
  originalItems: TimekeepingList[] = [];
  timekeepingStatus = TimekeepingStatus;

  leaveTypes: LeaveType[] = [];

  entitledDaysInput: { [employeeId: string]: number } = {};


  days: number[];
  months = [
    { value: 1, name: 'Ocak' },
    { value: 2, name: 'Şubat' },
    { value: 3, name: 'Mart' },
    { value: 4, name: 'Nisan' },
    { value: 5, name: 'Mayıs' },
    { value: 6, name: 'Haziran' },
    { value: 7, name: 'Temmuz' },
    { value: 8, name: 'Ağustos' },
    { value: 9, name: 'Eylül' },
    { value: 10, name: 'Ekim' },
    { value: 11, name: 'Kasım' },
    { value: 12, name: 'Aralık' }
    // ... diğer aylar
  ];
  years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i);
  
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  currentMonth: number
  currentYear: number

  anniversaryMessage: string = '';
  anniversaries: { name: string, date: Date, message: string }[] = []

  public entitledLeavesByEmployee: { [employeeId: string]: LeaveEntitledAdd[] } = {};
  

  constructor(private leaveEntitledService: LeaveEntitledService,
    private activatedRoute: ActivatedRoute,private router:Router,private fB:FormBuilder) {

    this.entitledLeaveForm = this.fB.group({
      employeeId: [''],
      leaveTypeId: [''],
      entitledDate: [''],
      entitledDays: [''],
      
    });
    
  }
  
  

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async params => {
      const year = params['year'] ? +params['year'] : new Date().getFullYear();
      const month = params['month'] ? +params['month'] : new Date().getMonth() + 1;
  
      this.selectedYear = year;
      this.selectedMonth = month;

      this.changeMonthOrYear(year, month);
  
      // Puantajları yükleyin ve ardından yıl dönümü kontrolünü yapın
      await this.loadTimekeepings(year, month);
      // Puantaj yükleme işlemi tamamlandıktan sonra yıl dönümü kontrolü
      this.checkAnniversariesForMonthAndYear(month, year);

      
    });
  }
  
  async loadTimekeepings(year: number, month: number): Promise<void> {
    
      const response = await this.leaveEntitledService.getTimekeepings(year, month);
      this.items = response.items;
      this.originalItems = [...this.items];
      this.initializeTimekeepingStatus();
    
  }

  checkAnniversariesForMonthAndYear(month: number, year: number) {
    this.anniversaries = []; // Önceki verileri temizle
    this.items.forEach(item => {
      if (item.hireDate) {
        const hireDate = new Date(item.hireDate);
        if (hireDate.getMonth() + 1 === month) {
          const years = year - hireDate.getFullYear();
          const message = `${item.firstName} ${item.lastName} isimli kişinin ${hireDate.getDate()}/${month}/${year} tarihinde işe giriş yıldönümüdür. Dikkat!`;
          this.anniversaries.push({ name: `${item.firstName} ${item.lastName}`, date: hireDate, message });
        }
      }
    });
}

  
  async initializeTimekeepingStatus() {
    await this.items.forEach(item => {
      // Her çalışan için ayın gün sayısına göre puantaj durumunu başlatın.
      const daysInMonth = new Date(this.selectedYear, this.selectedMonth , 0).getDate();
      this.timekeepingStatus[item.employeeId] = Array.from({ length: daysInMonth }, () => null);
      
      // Varolan puantaj kayıtlarını işleyin.
      item.timekeepings.forEach(tk => {
        const dayIndex = new Date(tk.date).getDate() - 1; // Gün indexi 0'dan başlar.
        this.timekeepingStatus[item.employeeId][dayIndex] = tk.status;
      });
    });
  }


  selectAll(gun: number) {
    // O gün için bütün personellerin durumları kontrol edilir
    const hepsiIsaretli = this.items.every(employee => 
      this.timekeepingStatus[employee.employeeId][gun] === TimekeepingStatus.Attended
    );

    // Eğer tüm personeller işaretliyse, hepsini null yap, değilse hepsini true yap
    this.items.forEach(employee => {
      this.timekeepingStatus[employee.employeeId][gun] = hepsiIsaretli ? null : TimekeepingStatus.Attended;

      // Değişiklik yapıldığını işaretle
      const changeKey = `${employee.employeeId}-${gun}`;
      this.changedTimekeepings.add(changeKey);
    });

    // Değişiklikleri manuel olarak bildir
    this.timekeepingStatus = { ...this.timekeepingStatus };
  }

  openConfirmModal() {
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    confirmModal.show();
  }

  saveChanges() {
    const timekeepingData: CreateTimekeeping[] = [];
  
    this.items.forEach(employee => {
      this.timekeepingStatus[employee.employeeId].forEach((status, dayIndex) => {
        const changeKey = `${employee.employeeId}-${dayIndex}`;
        if (this.changedTimekeepings.has(changeKey) && status !== TimekeepingStatus.NotSet) {
          // 'NotSet' değeri hariç, sadece değişiklik yapılan ve geçerli bir duruma sahip kayıtları işle
          const timekeeping: CreateTimekeeping = {
            employeeId: employee.employeeId,
            date: new Date(this.selectedYear, this.selectedMonth - 1, dayIndex + 2),
            status: status
          };
          timekeepingData.push(timekeeping);
        }
      });
    });
  
    // Geçerli durumlara sahip timekeeping kayıtlarıyla API çağrısını yap
    if (timekeepingData.length > 0) {
      Promise.all(timekeepingData.map(timekeeping => this.leaveEntitledService.addTimekeeping(timekeeping)))
        .then(() => {
          this.changedTimekeepings.clear(); // Başarılı kayıt sonrası değişiklikleri temizle
          alert('Timekeeping records successfully saved');
        })
        .catch(error => {
          console.error('An error occurred while saving timekeeping records', error);
          alert('An error occurred while saving timekeeping records');
        });
    } else {
      alert('No valid timekeeping records to save');
    }
  
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    confirmModal.hide();
  }
  
  
  
  // Ay ve yıl değiştiğinde günleri ve puantaj durumunu güncelle
  
  changeMonthOrYear(year: number, month: number) {
    // URL'i güncelleyerek yeni ay ve yıl ile sayfayı yeniden yükle
    this.router.navigate(['personeller/puantaj/puantaj-tablosu'], { queryParams: { year, month } });
  
    // Seçilen yıl ve ayı güncelle
    this.selectedYear = year;
    this.selectedMonth = month; // Doğrudan seçilen ayı kullan
    this.initializeDays(month, year); // Ay ve yıl parametrelerini doğru sırayla geçirin
   
  }

  initializeDays(month: number, year: number) {
    // Ay parametresi olarak verilen değer zaten 1 fazla olduğu için, doğrudan kullanılabilir.
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    this.days = Array.from({ length: lastDayOfMonth }, (_, i) => i + 1);
    this.items.forEach(employee => {
      // Her çalışan için bu ayın gün sayısına uygun olarak puantaj durumunu null ile doldurun
      this.timekeepingStatus[employee.employeeId] = Array(lastDayOfMonth).fill(null);
    });
  }

  changedTimekeepings: Set<string> = new Set();

  toggleTimekeeping(employeeId: string, dayIndex: number) {
    let currentStatus = this.timekeepingStatus[employeeId][dayIndex];
    let newStatus = TimekeepingStatus.Attended;
  
    switch(currentStatus) {
      case TimekeepingStatus.Attended:
        newStatus = TimekeepingStatus.Absent;
        break;
      case TimekeepingStatus.Absent:
        newStatus = TimekeepingStatus.OnSickLeave;
        break;
      case TimekeepingStatus.OnSickLeave:
        newStatus = TimekeepingStatus.NotSet;
        break;
      case TimekeepingStatus.NotSet:
        newStatus = TimekeepingStatus.Attended;
        break;
    }
  
    this.timekeepingStatus[employeeId][dayIndex] = newStatus;
  
    // Değişiklik yapıldığını işaretle
    const changeKey = `${employeeId}-${dayIndex}`;
    this.changedTimekeepings.add(changeKey);
  }

getAttendedDays(employeeId: string): number {
  return this.timekeepingStatus[employeeId].filter(status => status === TimekeepingStatus.Attended).length;
}

getNotAttendedDays(employeeId: string): number {
  return this.timekeepingStatus[employeeId].filter(status => status === TimekeepingStatus.Absent).length;
}

getSickDays(employeeId: string): number {
  return this.timekeepingStatus[employeeId].filter(status => status === TimekeepingStatus.OnSickLeave).length;
}


searchEmployees(event: Event) {
  const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  if (!searchTerm) {
    this.items = [...this.originalItems];
  } else {
    this.items = this.originalItems.filter(employee =>
      employee.firstName?.toLocaleLowerCase().includes(searchTerm) ||
      employee.lastName?.toLocaleLowerCase().includes(searchTerm) 
    );
  }
}

async addEntitledLeave(employeeId: string) {
  let lastDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
  let entitledDate = new Date(this.selectedYear, this.selectedMonth - 1, lastDayOfMonth);
  let entitledDays = this.entitledDaysInput[employeeId];

  // leaveTypeId'yi asenkron olarak al
  let leaveTypeId = await this.leaveEntitledService.listLeaveType(-1, -1)
    .then((response: listLeaveType) => {
      let yearlyLeaveType = response.items.find(leaveType => leaveType.name === 'Yıllık İzin');
      return yearlyLeaveType ? yearlyLeaveType.id : null;
    });

  // Form değerlerini ayarla
  const formValue = {
    employeeId: employeeId,
    entitledDate: entitledDate,
    entitledDays: entitledDays,
    leaveTypeId: leaveTypeId,
    leaveTypeName: 'Yıllık İzin'
  };

  // İstek gönder
  await this.leaveEntitledService.add(formValue).then(() => {
    console.log('Başarıyla eklendi');
    //sayfayı yenile
    this.router.navigate(['personeller/puantaj/puantaj-tablosu']);
  }).catch(error => {
    console.error('Hata:', error);
  });
}

goToEmployeePage(id: string) {
  this.router.navigate(['personeller/personel-listesi/personel', id]);
}


}
