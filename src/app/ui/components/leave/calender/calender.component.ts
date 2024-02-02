import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

interface DayStatus {
  date: number | ''; // '' eklendi çünkü bazı hücreler boş olabilir
  status: 'none' | 'present' | 'absent';
  reason?: string; // 'Mazeret İzni', 'Yıllık İzin', vb.
}

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss']
})
export class CalendarComponent implements OnInit {
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  months = [
    { name: 'Ocak', value: 0 }, { name: 'Şubat', value: 1 }, {name: 'Mart', value: 2}, { name: 'Nisan', value: 3 },
    { name: 'Mayıs', value: 4 }, { name: 'Haziran', value: 5 }, { name: 'Temmuz', value: 6 }, { name: 'Ağustos', value: 7 },
    { name: 'Eylül', value: 8 }, { name: 'Ekim', value: 9 }, { name: 'Kasım', value: 10 },{ name: 'Aralık', value: 11 },

  ];
  weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  calendar: DayStatus[][] = []
  absenceReasons = ['❌ Mazeret İzni', '❌ Yıllık İzin', '❌ Hastalık'];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 1);
    let firstDayOfWeek = firstDayOfMonth.getDay() - 1; // Pazartesi günü 0 olacak şekilde ayarlıyoruz.
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Eğer Pazar günü ise, onu haftanın sonuna alıyoruz.
  
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    
    // Takvimin ilk satırında boş hücreleri hesaplayıp, döngüye ona göre başlıyoruz.
    let day = 1 - firstDayOfWeek;
    this.calendar = [];
  
    for (let week = 0; week < 6; week++) {
      const weekDays: DayStatus[] = [];
      for (let weekDay = 0; weekDay < 7; weekDay++) {
        if (day > 0 && day <= daysInMonth) {
          weekDays.push({ date: day, status: 'none' });
        } else {
          weekDays.push({ date: '', status: 'none' }); // Boş günler için
        }
        day++;
      }
      this.calendar.push(weekDays);
    }
  }

  toggleDayStatus(day: any) {
    if (day.date) {
      day.status = day.status === 'none' ? 'present' : day.status === 'present' ? 'absent' : 'none';
    }
  }

  getYears() {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  }

  selectStatus(day: DayStatus, status: string) {
    if(day.reason){
      day.status === 'absent'; 
    }
    else if(!day.reason){
      day.status === 'present';
    }
    else if(day.status === 'none'){
      day.status === undefined;
    }
    
}
}