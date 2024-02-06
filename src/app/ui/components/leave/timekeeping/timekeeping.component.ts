import { Component, OnInit } from '@angular/core';
import { CommonModule, Time } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTimekeeping } from 'src/app/contracts/leave/createTimekeeping';
import { LeaveEntitledService } from 'src/app/services/common/models/leave-entitled.service';
import { PageRequest } from 'src/app/contracts/pageRequest';
import { GetListResponse } from 'src/app/contracts/getListResponse';
import { TimekeepingList } from 'src/app/contracts/leave/timekeepingList';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-timekeeping',
  standalone: true,
  imports: [CommonModule ,FormsModule],
  templateUrl: './timekeeping.component.html',
  styleUrls: ['./timekeeping.component.scss']
})
export class TimekeepingComponent implements OnInit {

  

  constructor(private leaveEntitledService: LeaveEntitledService,private activatedRoute: ActivatedRoute,private router:Router) {}
  
  pageRequest: PageRequest = { pageIndex: -1, pageSize: -1 };

  employeeList: GetListResponse<TimekeepingList>[] = [];
  items: TimekeepingList[] = [];
  timekeepingStatus: { [employeeId: string]: boolean[] } = {};

  days: number[];
  months = Array.from({ length: 12 }, (_, index) => index +1);
  years = [2022, 2023, 2024]; // Örnek olarak 3 yıl eklenmiştir.
  
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  currentMonth: number
  currentYear: number
  
  employeeSearch: string = '';

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
    
  }
  
  async loadTimekeepings(year: number, month: number) {
    try {
        const response = await this.leaveEntitledService.getTimekeepings(year , month);
        this.items = response.items;
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


  toggleTimekeeping(employeeId: string, day: number) {
    const currentStatus = this.timekeepingStatus[employeeId][day];
    
    if (currentStatus === true) {
      // İşe gelmedi olarak işaretle
      this.timekeepingStatus[employeeId][day] = false;
    } else if (currentStatus === false) {
      // Veri yok olarak işaretle
      this.timekeepingStatus[employeeId][day] = null;
    } else {
      // İşe geldi olarak işaretle
      this.timekeepingStatus[employeeId][day] = true;
    }
  }

  selectAll(gun: number) {
    // O gün için bütün personellerin durumları kontrol edilir
    const hepsiIsaretli = this.items.every(employee => 
      this.timekeepingStatus[employee.employeeId][gun] === true
    );

    // Eğer tüm personeller işaretliyse, hepsini null yap, değilse hepsini true yap
    this.items.forEach(employee => {
      this.timekeepingStatus[employee.employeeId][gun] = hepsiIsaretli ? null : true;
    });

    // Değişiklikleri manuel olarak bildir
    this.timekeepingStatus = { ...this.timekeepingStatus };
  }

  

create() {
    const timekeepingData: CreateTimekeeping[] = [];
    this.items.forEach(employee => {
      this.timekeepingStatus[employee.employeeId].forEach((status, index) => {
        if (status !== null) {
          const timekeepingData: CreateTimekeeping = {
            employeeId: employee.employeeId,
            date: new Date(this.selectedYear, this.selectedMonth -1, index + 2),
            status: status
          };
          this.leaveEntitledService.create(timekeepingData)
            .then(() => {
              alert('Puantaj kayıtları başarıyla kaydedildi');
            })
            .catch(error => {
              console.error('Puantaj kayıtları kaydedilirken bir hata oluştu', error);
              alert('Puantaj kayıtları kaydedilirken bir hata oluştu');
            });
        }
      });
    });
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
  
 
  
}
