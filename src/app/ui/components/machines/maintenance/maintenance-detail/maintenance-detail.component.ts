import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { MaintenanceService } from 'src/app/services/common/models/maintenance.service';
import { Maintenance } from 'src/app/contracts/maintenance/maintenance';
import { MaintenanceFile } from 'src/app/contracts/maintenance/maintenance-file';
import { switchMap } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-maintenance-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './maintenance-detail.component.html',
  styleUrls: ['./maintenance-detail.component.scss']
})
export class MaintenanceDetailComponent extends BaseComponent implements OnInit {
  maintenance: Maintenance;
  maintenanceFiles: MaintenanceFile[] = [];
  maintenanceId: string;
  machineId: string;
  isLoading: boolean = false;
  
  // Lightbox için
  selectedFile: any = null;
  showLightbox: boolean = false;

  constructor(
    spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private maintenanceService: MaintenanceService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      // Get IDs from route
      this.route.paramMap.subscribe(async params => {
        this.machineId = params.get('machineId');
        this.maintenanceId = params.get('maintenanceId');
        
        await this.loadMaintenance();
        
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  async loadMaintenance(): Promise<void> {
    this.isLoading = true;
    
    try {
      this.maintenance = await this.maintenanceService.getById(this.maintenanceId);
      
      // Backend'den gelen maintenanceFiles'ı kullan
      if (this.maintenance.maintenanceFiles && this.maintenance.maintenanceFiles.length > 0) {
        this.maintenanceFiles = this.maintenance.maintenanceFiles.map(file => {
          // URL yapısı: baseUrl/category/path/name
          const baseUrl = 'http://localhost:5278';
          const fullUrl = `${baseUrl}/${file.category}/${file.path}/${file.name}`;
          
          return {
            ...file,
            url: fullUrl,
            safeUrl: this.sanitizer.bypassSecurityTrustUrl(fullUrl)
          };
        });
      }
      
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading maintenance:', error);
      this.isLoading = false;
    }
  }

  // Dosyayı lightbox'ta görüntüle
  viewFile(file: any): void {
    this.selectedFile = file;
    this.showLightbox = true;
  }

  // Lightbox'ı kapat
  closeLightbox(): void {
    this.showLightbox = false;
    this.selectedFile = null;
  }

  // Dosya türünü kontrol et
  isImage(fileName: string): boolean {
    if (!fileName) return false;
    const ext = fileName.toLowerCase();
    return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || 
           ext.endsWith('.png') || ext.endsWith('.gif') || 
           ext.endsWith('.webp') || ext.endsWith('.bmp');
  }

  isPdf(fileName: string): boolean {
    return fileName?.toLowerCase().endsWith('.pdf');
  }

  goBack(): void {
    this.router.navigate(['/makinalar/makina', this.machineId, 'bakim']);
  }

  formatDate(date: Date): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatDateTime(date: Date): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMaintenanceTypeIcon(typeName: string): string {
    const type = typeName?.toLowerCase();
    
    if (type?.includes('rutin') || type?.includes('periyodik')) {
      return 'fas fa-calendar-check';
    } else if (type?.includes('onarım') || type?.includes('arıza')) {
      return 'fas fa-wrench';
    } else if (type?.includes('acil')) {
      return 'fas fa-exclamation-triangle';
    }
    
    return 'fas fa-tools';
  }

  getMaintenanceTypeBadgeClass(typeName: string): string {
    const type = typeName?.toLowerCase();
    
    if (type?.includes('rutin') || type?.includes('periyodik')) {
      return 'badge-routine';
    } else if (type?.includes('onarım') || type?.includes('arıza')) {
      return 'badge-repair';
    } else if (type?.includes('acil')) {
      return 'badge-emergency';
    }
    
    return 'badge-default';
  }

  printImage(fileName: string): void {
    let printContents, popupWin;
    const imageName = 'printableImage' + fileName;
    printContents = document.getElementById(imageName)?.outerHTML;
    
    if (!printContents) return;
    
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <style>
            body { 
              margin: 0; 
              font-size: 12px;
            }
            @media print {
              @page { 
                margin: 0;
                size: auto;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">${printContents}</body>
      </html>
    `);
    popupWin.document.close();
  }

  // Dosyayı indir - Onay ile ve tüm tarayıcılarda çalışacak şekilde
  downloadFile(file: any): void {
    // Önce kullanıcıya sor
    const confirmDownload = confirm(`"${file.name}" dosyasını indirmek istiyor musunuz?`);
    
    if (!confirmDownload) {
      return; // Kullanıcı vazgeçti
    }

    console.log('Downloading file:', file.url);
    
    this.http.get(file.url, { 
      responseType: 'blob',
      observe: 'response',
      withCredentials: false
    }).subscribe({
      next: (response) => {
        console.log('Download response:', response);
        
        const blob = response.body;
        if (!blob) {
          console.error('Blob bulunamadı');
          alert('Dosya indirilemedi.');
          return;
        }
        
        // Edge ve tüm tarayıcılar için uyumlu yöntem
        if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
          // IE ve eski Edge için
          (window.navigator as any).msSaveOrOpenBlob(blob, file.name);
        } else {
          // Modern tarayıcılar için
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Geçici bir iframe kullanarak indir (Edge için daha güvenilir)
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = file.name;
          link.target = '_blank';
          
          // iframe'in içine ekle
          if (iframe.contentWindow) {
            iframe.contentWindow.document.body.appendChild(link);
            link.click();
          } else {
            // iframe kullanılamazsa direkt body'ye ekle
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          
          // Temizlik
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(blobUrl);
          }, 250);
        }
        
        console.log('Dosya indiriliyor:', file.name);
      },
      error: (error) => {
        console.error('Dosya indirme hatası:', error);
        alert('Dosya indirilemedi. Lütfen tekrar deneyin.\n\nHata: ' + (error.message || 'Bilinmeyen hata'));
      }
    });
  }

  isUpcomingMaintenance(): boolean {
    if (!this.maintenance?.nextMaintenanceHour) return false;
    const currentHour = this.maintenance.machineWorkingTimeOrKilometer;
    const hoursRemaining = this.maintenance.nextMaintenanceHour - currentHour;
    return hoursRemaining <= 100 && hoursRemaining > 0;
  }

  getHoursUntilNextMaintenance(): number {
    if (!this.maintenance?.nextMaintenanceHour) return -1;
    const currentHour = this.maintenance.machineWorkingTimeOrKilometer;
    return this.maintenance.nextMaintenanceHour - currentHour;
  }
}
