import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { SafePipe } from 'src/app/pipes/safe.pipe';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quarry-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SafePipe],
  templateUrl: './quarry-page.component.html',
  styleUrls: ['./quarry-page.component.scss']
})
export class QuarryPageComponent extends BaseComponent implements OnInit {
  
  quarry: Quarry | null = null;
  quarryId: string = '';
  activeTab: 'info' | 'employees' | 'machines' | 'files' | 'production' | 'map' = 'info';
  
  selectedFiles: FileList | null = null;
  
  constructor(
    spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private quarryService: QuarryService,
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.quarryId = params['quarryId'];
      if (this.quarryId) {
        await this.loadQuarryDetails();
      }
    });
  }

  async loadQuarryDetails(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      this.quarry = await this.quarryService.getById(this.quarryId);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Ocak detayları yüklenemedi');
    }
  }

  setActiveTab(tab: 'info' | 'employees' | 'machines' | 'files' | 'production' | 'map'): void {
    this.activeTab = tab;
  }

  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
  }

  async uploadFiles(): Promise<void> {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this.toastr.warning('Lütfen dosya seçiniz');
      return;
    }
    
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      const formData = new FormData();
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('files', this.selectedFiles[i]);
      }
      formData.append('quarryId', this.quarryId);
      
      const result = await firstValueFrom(
        this.http.post('http://localhost:5278/api/quarryfiles/upload', formData)
      );
      
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success('Dosyalar başarıyla yüklendi');
      this.selectedFiles = null;
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await this.loadQuarryDetails();
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Dosyalar yüklenirken hata oluştu');
      console.error(error);
    }
  }

  downloadFile(file: any): void {
    // Dosya path'ini kullanarak direkt açma
    const baseUrl = 'http://localhost:5278/';
    const fullPath = baseUrl + file.path;
    window.open(fullPath, '_blank');
  }

  async deleteFile(fileId: string, filePath: string): Promise<void> {
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);
    try {
      await firstValueFrom(
        this.http.delete(`http://localhost:5278/api/quarryfiles?path=${encodeURIComponent(filePath)}`)
      );
      
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.success('Dosya başarıyla silindi');
      await this.loadQuarryDetails();
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastr.error('Dosya silinirken hata oluştu');
      console.error(error);
    }
  }

  getGoogleMapsUrl(): string {
    if (!this.quarry || !this.quarry.latitude || !this.quarry.longitude) {
      return '';
    }
    return `https://www.google.com/maps?q=${this.quarry.latitude},${this.quarry.longitude}&output=embed`;
  }

  back(): void {
    this.router.navigate(['/ocaklar/ocak-listesi']);
  }
}
