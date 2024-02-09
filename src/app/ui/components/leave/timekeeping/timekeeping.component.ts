import { Component, OnInit } from '@angular/core';
import { CommonModule, Time } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTimekeeping } from 'src/app/contracts/leave/createTimekeeping';
import { LeaveEntitledService } from 'src/app/services/common/models/leave-entitled.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { TimekeepingList } from 'src/app/contracts/leave/timekeepingList';
import { ActivatedRoute, Router } from '@angular/router';

declare var bootstrap: any;


@Component({
  selector: 'app-timekeeping',
  standalone: true,
  imports: [CommonModule ,FormsModule],
  templateUrl: './timekeeping.component.html',
  styleUrls: ['./timekeeping.component.scss', '../../../../../styles.scss']
})
export class TimekeepingComponent implements OnInit {

  

  constructor(private leaveEntitledService: LeaveEntitledService,private activatedRoute: ActivatedRoute,private router:Router) {}
  
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  employeeList: GetListResponse<TimekeepingList>[] = [];
  items: TimekeepingList[] = [];
  originalItems: TimekeepingList[] = [];
  timekeepingStatus: { [employeeId: string]: boolean[] } = {};

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
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  currentMonth: number
  currentYear: number

  async ngOnInit() {
    const currentDate = new Date();
    
    this.currentYear = currentDate.getFullYear();
    this.currentMonth = currentDate.getMonth() +1; 
    
    this.activatedRoute.queryParams.subscribe(params => {
      const year = params['year'] ? +params['year'] : new Date().getFullYear();
      const month = params['month'] ? +params['month'] : new Date().getMonth() + 1;

      this.changeMonthOrYear(year, month);
      
      this.loadTimekeepings(year, month);
    });
    this.originalItems = [...this.items];
  }

  
  async loadTimekeepings(year: number, month: number) {
    try {
        const response = await this.leaveEntitledService.getTimekeepings(year , month);
        this.items = response.items;
        this.originalItems = [...this.items];
        this.initializeTimekeepingStatus();
    } catch (error) {
        console.error('Puantaj listesi yüklenirken bir hata oluştu', error);
    }
}
  
  initializeTimekeepingStatus() {
    this.items.forEach(item => {
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
      this.timekeepingStatus[employee.employeeId][gun] === true
    );

    // Eğer tüm personeller işaretliyse, hepsini null yap, değilse hepsini true yap
    this.items.forEach(employee => {
      this.timekeepingStatus[employee.employeeId][gun] = hepsiIsaretli ? null : true;

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
        if (this.changedTimekeepings.has(changeKey)) {
          // Sadece değişiklik yapılanları kaydet
          const timekeeping: CreateTimekeeping = {
            employeeId: employee.employeeId,
            date: new Date(this.selectedYear, this.selectedMonth - 1, dayIndex + 2),
            status: status
          };
          timekeepingData.push(timekeeping);
        }
      });
    });
  
    // API çağrısı yap ve `changedTimekeepings` setini temizle
    // In your component file
    Promise.all(timekeepingData.map(timekeeping => this.leaveEntitledService.create(timekeeping)))
      .then(() => {
        this.changedTimekeepings.clear(); // Clear changes after successful save
        alert('Timekeeping records successfully saved');
      })
      .catch(error => {
        console.error('An error occurred while saving timekeeping records', error);
        alert('An error occurred while saving timekeeping records');
      });
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    confirmModal.hide();
  }
  
  
  // Ay ve yıl değiştiğinde günleri ve puantaj durumunu güncelle
  
  changeMonthOrYear(year: number, month: number) {
    // URL'i güncelleyerek yeni ay ve yıl ile sayfayı yeniden yükle
    this.router.navigate(['/leave/timekeeping'], { queryParams: { year, month } });
  
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
  const currentStatus = this.timekeepingStatus[employeeId][dayIndex];
  const newStatus = currentStatus === true ? false : (currentStatus === false ? null : true);

  this.timekeepingStatus[employeeId][dayIndex] = newStatus;

  // Değişiklik yapıldığını işaretle
  const changeKey = `${employeeId}-${dayIndex}`;
  this.changedTimekeepings.add(changeKey);
}

getAttendedDays(employeeId: string): number {
  return this.timekeepingStatus[employeeId].filter(status => status === true).length;
}

getNotAttendedDays(employeeId: string): number {
  return this.timekeepingStatus[employeeId].filter(status => status === false).length;
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
openModal(){
  
}
}
