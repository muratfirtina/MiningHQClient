import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { MaintenanceService } from 'src/app/services/common/models/maintenance.service';
import { MaintenanceTypeService } from 'src/app/services/common/models/maintenance-type.service';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { MaintenanceType } from 'src/app/contracts/maintenance/maintenance-type';
import { CreateMaintenance } from 'src/app/contracts/maintenance/create-maintenance';
import { Machine } from 'src/app/contracts/machine/machine';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-maintenance-add',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './maintenance-add.component.html',
  styleUrls: ['./maintenance-add.component.scss']
})
export class MaintenanceAddComponent extends BaseComponent implements OnInit {
  maintenanceForm: FormGroup;
  maintenanceTypes: MaintenanceType[] = [];
  machine: Machine;
  machineId: string;
  selectedFiles: File[] = [];
  uploadProgress: number = 0;
  isUploading: boolean = false;

  constructor(
    spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private maintenanceService: MaintenanceService,
    private maintenanceTypeService: MaintenanceTypeService,
    private machineService: MachineService,
    private toastrService: CustomToastrService
  ) {
    super(spinner);
    // Form'u constructor'da initialize et
    this.initForm();
  }

  async ngOnInit(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      // Get machine ID from route
      this.route.paramMap.pipe(
        switchMap(params => {
          this.machineId = params.get('machineId');
          return this.machineService.getById(this.machineId);
        })
      ).subscribe(async machine => {
        this.machine = machine;
        await this.loadMaintenanceTypes();
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.toastrService.message(
        'Veri yüklenirken hata oluştu',
        'Hata',
        new ToastrOptions(ToastrMessageType.Error, ToastrPosition.BottomRight)
      );
    }
  }

  initForm(): void {
    this.maintenanceForm = this.fb.group({
      maintenanceTypeId: ['', Validators.required],
      maintenanceDate: ['', Validators.required],
      machineWorkingTimeOrKilometer: ['', [Validators.required, Validators.min(0)]],
      maintenanceFirm: ['', Validators.required],
      nextMaintenanceHour: ['', Validators.min(0)],
      partsChanged: [''],
      oilsChanged: [''],
      description: ['', Validators.required]
    });
  }

  async loadMaintenanceTypes(): Promise<void> {
    try {
      const response = await this.maintenanceTypeService.list(0, 1000);
      this.maintenanceTypes = response.items || [];
    } catch (error) {
      console.error('Error loading maintenance types:', error);
      this.maintenanceTypes = [];
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    if (this.maintenanceForm.invalid) {
      this.toastrService.message(
        'Lütfen tüm zorunlu alanları doldurun',
        'Uyarı',
        new ToastrOptions(ToastrMessageType.Warning, ToastrPosition.BottomRight)
      );
      return;
    }

    this.showSpinner(SpinnerType.BallSpinClockwise);

    try {
      const formValue = this.maintenanceForm.value;
      
      const createMaintenance: CreateMaintenance = {
        machineId: this.machineId,
        maintenanceTypeId: formValue.maintenanceTypeId,
        description: formValue.description,
        maintenanceDate: new Date(formValue.maintenanceDate),
        machineWorkingTimeOrKilometer: formValue.machineWorkingTimeOrKilometer,
        maintenanceFirm: formValue.maintenanceFirm,
        nextMaintenanceHour: formValue.nextMaintenanceHour ? parseInt(formValue.nextMaintenanceHour) : null,
        partsChanged: formValue.partsChanged,
        oilsChanged: formValue.oilsChanged
      };

      // Create maintenance
      const response = await this.maintenanceService.create(createMaintenance);
      
      // If files selected, upload them
      if (this.selectedFiles.length > 0 && response.id) {
        try {
          this.isUploading = true;
          await this.maintenanceService.uploadMaintenanceFiles(response.id, this.selectedFiles);
          
          this.toastrService.message(
            'Bakım kaydı ve dosyalar başarıyla yüklendi',
            'Başarılı',
            new ToastrOptions(ToastrMessageType.Success, ToastrPosition.BottomRight)
          );
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          this.toastrService.message(
            'Bakım kaydı oluşturuldu ancak dosyalar yüklenemedi',
            'Uyarı',
            new ToastrOptions(ToastrMessageType.Warning, ToastrPosition.BottomRight)
          );
        } finally {
          this.isUploading = false;
        }
      } else {
        this.toastrService.message(
          'Bakım kaydı başarıyla oluşturuldu',
          'Başarılı',
          new ToastrOptions(ToastrMessageType.Success, ToastrPosition.BottomRight)
        );
      }
      
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      this.goBack();

    } catch (error) {
      console.error('Error:', error);
      this.toastrService.message(
        'Bir hata oluştu',
        'Hata',
        new ToastrOptions(ToastrMessageType.Error, ToastrPosition.BottomRight)
      );
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  goBack(): void {
    if (this.machineId) {
      this.router.navigate(['/makinalar/makina', this.machineId, 'bakim']);
    } else {
      this.router.navigate(['/makinalar']);
    }
  }

  getMaintenanceTypeName(id: string): string {
    const type = this.maintenanceTypes.find(t => t.id === id);
    return type ? type.name : '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
