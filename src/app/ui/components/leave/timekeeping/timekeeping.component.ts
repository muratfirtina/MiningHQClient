import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTimekeeping } from 'src/app/contracts/leave/createTimekeeping';
import { LeaveEntitledService } from 'src/app/services/common/models/leave-entitled.service';
import { EmployeeService } from 'src/app/services/common/models/employee.service';
import { SingleEmployee } from 'src/app/contracts/employee/single-employee';
import { ListEmployee } from 'src/app/contracts/employee/list-employee';

@Component({
  selector: 'app-timekeeping',
  standalone: true,
  imports: [CommonModule ,FormsModule],
  templateUrl: './timekeeping.component.html',
  styleUrls: ['./timekeeping.component.scss']
})
export class TimekeepingComponent implements OnInit {

  personelListesi = [
    { adi: 'Murat Fırtına' },
    { adi: 'Orhan Kaya' },
    { adi: 'Lütfi Bursalı' },
    { adi: 'Fatih Zengin' }
  ];

  puantajDurumu = {
    'Murat Fırtına': [null, null, true, false], // ve böyle devam eder
    'Orhan Kaya': [null, null, true, null],
    'Lütfi Bursalı': [null, null, null, null],
    'Fatih Zengin': [null, null, null, null]
    // Diğer personeller için de benzer şekilde...
  };
  gunler: number[];

  constructor(private leaveEntitledService: LeaveEntitledService, private employeeService: EmployeeService) {


    const simdikiTarih = new Date();
    const yil = simdikiTarih.getFullYear();
    const ay = simdikiTarih.getMonth(); // JavaScript'te ay 0'dan başlar (0: Ocak, 1: Şubat, ...)
    const ayinSonGunu = new Date(yil, ay + 1, 0).getDate();

    // Aydaki gün sayısına göre bir dizi oluştur (Örneğin: Ocak için 1'den 31'e kadar)
    this.gunler = Array.from({length: ayinSonGunu}, (_, i) => i + 1);

    // Her personel için ayın her günü için puantaj durumunu false olarak başlat
    this.personelListesi.forEach(personel => {
      this.puantajDurumu[personel.adi] = Array(ayinSonGunu).fill(null);
    });
  }
  async ngOnInit() {
    await this.loadEmployees();
  }

  async loadEmployees() {
    try {
      const response: ListEmployee = await this.employeeService.list();
      this.personelListesi = response.items.map(employee => ({
        id: employee.id, // personelListesi için id'yi de saklamak önemli
        adi: `${employee.firstName} ${employee.lastName}`
      }));
    } catch (error) {
      console.error('Personel listesi yüklenirken bir hata oluştu', error);
    }
  }

  togglePuantaj(personelAdi: string, gun: number) {
    const currentStatus = this.puantajDurumu[personelAdi][gun];
    
    if (currentStatus === null) {
      this.puantajDurumu[personelAdi][gun] = true; // İlk tıklamada geldi (yeşil tik)
    } else if (currentStatus === true) {
      this.puantajDurumu[personelAdi][gun] = false; // İkinci tıklamada gelmedi (kırmızı x)
    } else {
      this.puantajDurumu[personelAdi][gun] = null; // Üçüncü tıklamada veri yok (- işareti)
    }
    
    // Angular'a değişiklikleri bildirmek için yeni bir nesne atayarak referansı güncelle
    this.puantajDurumu[personelAdi] = [...this.puantajDurumu[personelAdi]];
    this.puantajDurumu = { ...this.puantajDurumu };
  }

  tumunuIsaretle(gun: number) {
    // O gün için bütün personellerin durumları kontrol edilir
    const hepsiIsaretli = this.personelListesi.every(personel => 
      this.puantajDurumu[personel.adi][gun] === true
    );

    // Eğer tüm personeller işaretliyse, hepsini null yap, değilse hepsini true yap
    this.personelListesi.forEach(personel => {
      this.puantajDurumu[personel.adi][gun] = hepsiIsaretli ? null : true;
    });

    // Değişiklikleri manuel olarak bildir
    this.puantajDurumu = { ...this.puantajDurumu };
  }

  kaydet() {
    // Backend'e gönderilecek veri yapısını oluşturacak bir dizi
    const puantajKayitlari = [];
  
    // Her bir personel için puantaj durumunu dön ve kayıt oluştur
    this.personelListesi.forEach(personel => {
      const personelPuantaj = this.puantajDurumu[personel.adi];
      personelPuantaj.forEach((durum, gunIndex) => {
        if (durum !== null) {
          // Tarih objesi oluştur
          const tarih = new Date(this.secilenYil, this.secilenAy, gunIndex + 1);
          // Tarihi dd.mm.yyyy formatına dönüştür
          const tarihString = tarih.toLocaleDateString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          }).split('.').reverse().join('.');
  
          puantajKayitlari.push({
            personelAdi: personel.adi,
            gun: tarihString,
            durum: durum
          });
        }
      });
    });
  
    // Şimdi puantajKayitlari dizisini backend'e gönderebiliriz
    console.log('Backend\'e gönderilecek puantaj kayıtları:', puantajKayitlari);
    
    // HTTP isteği gönderme işlemi burada yapılacak
    // Örneğin: this.http.post('api/puantaj-kaydet', puantajKayitlari).subscribe(...)
  }
  

  arananPersonel: string = '';

  // Ay ve yıl seçimi için eklenen modeller
  secilenAy: number = new Date().getMonth();
  secilenYil: number = new Date().getFullYear();

  // Ay ve yıl seçimleri için seçenekler
  aylar = Array.from({ length: 12 }, (_, index) => index);
  yillar = [2022, 2023, 2024]; // Örnek olarak 3 yıl eklenmiştir.

  // Ay ve yıl değiştiğinde günleri ve puantaj durumunu güncelle
  ayYilDegistir() {
    const ayinSonGunu = new Date(this.secilenYil, this.secilenAy + 1, 0).getDate();
    this.gunler = Array.from({length: ayinSonGunu}, (_, i) => i + 1);
    this.puantajDurumuGuncelle();
  }

  // Ay ve yıl değiştiğinde puantaj durumunu sıfırla
  puantajDurumuGuncelle() {
    this.personelListesi.forEach(personel => {
      this.puantajDurumu[personel.adi] = Array(this.gunler.length).fill(null); // false yerine null kullanıyoruz.
    });
  }

  // ... mevcut kodlar ...

  // Arama fonksiyonu
  get filtrelenmisPersonelListesi() {
    return this.arananPersonel
      ? this.personelListesi.filter(personel =>
          personel.adi.toLowerCase().includes(this.arananPersonel.toLowerCase())
        )
      : this.personelListesi;
  }


  async create() {
    const puantajKayitlari = [];
    this.employeeService.list(personel => {
      const personelPuantaj = this.puantajDurumu[personel.adi];
      personelPuantaj.forEach((durum, gunIndex) => {
        if (durum !== null) {
          const tarih = new Date(this.secilenYil, this.secilenAy, gunIndex + 1);
          const timekeepingData: CreateTimekeeping = {
            date: tarih,
            employeeId: personel.id, // Burada personel.id backend'e gönderilecek uygun ID olmalıdır.
            status: durum
          };
          puantajKayitlari.push(timekeepingData);
        }
      });
    });
  
    for (const kayit of puantajKayitlari) {
      await this.leaveEntitledService.create(kayit);
    }
  }

 
  
}
