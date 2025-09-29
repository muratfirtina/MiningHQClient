import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FileUploadComponent } from 'src/app/services/common/file-upload/file-upload.component';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { DialogService } from 'src/app/services/common/dialog.service';
import { ListImageFile } from 'src/app/contracts/list-image-file';
import { Machine } from 'src/app/contracts/machine/machine';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';
import { switchMap } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface MachineFileWithSafeUrl extends ListImageFile {
  safeUrl?: SafeUrl;
}

@Component({
  selector: 'app-machine-files',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadComponent,
    MatDialogModule,
    MatCardModule
  ],
  templateUrl: './machine-files.component.html',
  styleUrls: ['./machine-files.component.scss', '../../../../../styles.scss']
})
export class MachineFilesComponent extends BaseComponent implements OnInit {

  machineFiles: MachineFileWithSafeUrl[] = [];
  machine: Machine;
  isLoading: boolean = false;

  constructor(
    spinner: NgxSpinnerService,
    private machineService: MachineService,
    private dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toastrService: CustomToastrService
  ) {
    super(spinner);
  }

  async ngOnInit(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      // Get machine ID from route
      this.route.paramMap.pipe(
        switchMap(params => {
          const machineId = params.get('machineId');
          if (!machineId) {
            throw new Error('Machine ID not found in route');
          }
          return this.machineService.getMachineById(machineId);
        })
      ).subscribe({
        next: (machine) => {
          this.machine = machine;
          this.getMachineFiles(machine.id);
        },
        error: (error) => {
          console.error('Error loading machine:', error);
          this.showToastr('Makina bilgileri yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
          this.goBack();
        }
      });
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.showToastr('Sayfa yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
      this.goBack();
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  /**
   * Get machine files from server
   */
  async getMachineFiles(machineId: string): Promise<void> {
    this.isLoading = true;
    
    try {
      const response = await this.machineService.getMachineFiles(machineId);
      this.machineFiles = response.map(file => ({
        ...file,
        safeUrl: this.sanitizer.bypassSecurityTrustUrl(file.url)
      }));
      
      if (this.machineFiles.length > 0) {
        this.showToastr(`${this.machineFiles.length} dosya yüklendi`, 'Başarılı', ToastrMessageType.Success);
      }
    } catch (error) {
      console.error('Failed to load machine files:', error);
      this.machineFiles = [];
      
      // Check if it's a 404 error (endpoint not implemented or no files)
      if ((error as any)?.status === 404) {
        console.log('No machine files found or endpoint returning 404');
        this.showToastr('Bu makina için henüz dosya bulunmuyor', 'Bilgi', ToastrMessageType.Info);
      } else if ((error as any)?.status >= 500) {
        this.showToastr('Sunucu hatası: Makina dosyaları yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
      } else {
        this.showToastr('Makina dosyaları yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Add new files to machine
   */
  addMachineFiles(): void {
    if (!this.machine?.id) {
      this.showToastr('Makina bilgisi bulunamadı', 'Hata', ToastrMessageType.Error);
      return;
    }

    // TODO: Implement file upload dialog for machines
    this.showToastr('Dosya yükleme özelliği yakında eklenecek', 'Bilgi', ToastrMessageType.Info);
  }

  /**
   * Delete machine file
   */
  async deleteMachineFile(fileId: string): Promise<void> {
    try {
      const confirmed = await this.confirmDelete();
      if (!confirmed) return;

      this.isLoading = true;
      // TODO: Implement delete functionality
      // await this.machineService.deleteMachineFile(fileId);
      
      this.machineFiles = this.machineFiles.filter(file => file.id !== fileId);
      this.showToastr('Dosya başarıyla silindi', 'Başarılı', ToastrMessageType.Success);
    } catch (error) {
      console.error('Error deleting file:', error);
      this.showToastr('Dosya silinirken hata oluştu', 'Hata', ToastrMessageType.Error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Download machine file
   */
  downloadFile(file: MachineFileWithSafeUrl): void {
    try {
      const link = document.createElement('a');
      link.href = file.url; // Use original URL instead of safeUrl
      link.download = file.fileName || 'machine-file';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showToastr('Dosya indiriliyor', 'Bilgi', ToastrMessageType.Info);
    } catch (error) {
      console.error('Error downloading file:', error);
      this.showToastr('Dosya indirilirken hata oluştu', 'Hata', ToastrMessageType.Error);
    }
  }

  /**
   * Open file preview in a new window
   */
  openFilePreview(file: MachineFileWithSafeUrl): void {
    try {
      // Use original URL for opening in new window
      window.open(file.url, '_blank');
      this.showToastr('Dosya önizlemesi açılıyor', 'Bilgi', ToastrMessageType.Info);
    } catch (error) {
      console.error('Error opening file preview:', error);
      this.showToastr('Dosya önizleme yapılamadı', 'Uyarı', ToastrMessageType.Warning);
    }
  }

  /**
   * Confirm and delete file
   */
  async confirmDeleteFile(file: MachineFileWithSafeUrl): Promise<void> {
    const confirmed = await this.confirmDelete();
    if (confirmed) {
      await this.deleteMachineFile(file.id);
    }
  }

  /**
   * Print image file
   */
  printImage(fileName: string): void {
    try {
      const imageName = 'printableImage' + fileName;
      const imageElement = document.getElementById(imageName);
      
      if (!imageElement) {
        this.showToastr('Yazdırılacak görsel bulunamadı', 'Uyarı', ToastrMessageType.Warning);
        return;
      }

      const printContents = imageElement.outerHTML;
      const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>Makina Dosyası - ${fileName}</title>
              <style>
                body { 
                  margin: 0; 
                  font-size: 12px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
                @media print {
                  @page { 
                    margin: 0.5in;
                    size: auto;
                  }
                  body {
                    print-color-adjust: exact;
                  }
                }
              </style>
            </head>
            <body onload="window.print(); window.close();">${printContents}</body>
          </html>
        `);
        popupWin.document.close();
      }
    } catch (error) {
      console.error('Error printing image:', error);
      this.showToastr('Yazdırma sırasında hata oluştu', 'Hata', ToastrMessageType.Error);
    }
  }

  /**
   * Navigate back to machine detail page
   */
  goBack(): void {
    if (this.machine?.id) {
      this.router.navigate([`/makinalar/makina/${this.machine.id}`]);
    } else {
      this.router.navigate(['/makinalar']);
    }
  }

  /**
   * Get file type icon
   */
  getFileIcon(fileName: string): string {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fas fa-file-word';
      case 'xls':
      case 'xlsx':
        return 'fas fa-file-excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'fas fa-file-image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'fas fa-file-video';
      case 'zip':
      case 'rar':
        return 'fas fa-file-archive';
      default:
        return 'fas fa-file';
    }
  }

  /**
   * Check if file is an image
   */
  isImageFile(fileName: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = fileName?.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }

  /**
   * Get file size in human readable format
   */
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format file upload date
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Tarih bilinmiyor';
    }
  }

  /**
   * Confirm delete action
   */
  private async confirmDelete(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = confirm('Bu dosyayı silmek istediğinizden emin misiniz?');
      resolve(confirmed);
    });
  }

  /**
   * Show toast notification
   */
  private showToastr(message: string, title: string, type: ToastrMessageType): void {
    this.toastrService.message(message, title, new ToastrOptions(type, ToastrPosition.TopRight));
  }

  /**
   * Track by function for ngFor performance
   */
  trackByFileId(index: number, file: MachineFileWithSafeUrl): string {
    return file.id;
  }
}
