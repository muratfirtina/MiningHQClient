import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MachineService } from 'src/app/services/common/models/machine.service';
import { CreateMachine } from 'src/app/contracts/machine/create-machine';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomToastrService, ToastrMessageType, ToastrOptions, ToastrPosition } from 'src/app/services/common/custom-toastr.service';

// Services for dropdowns
import { BrandService } from 'src/app/services/common/models/brand.service';
import { ModelService } from 'src/app/services/common/models/model.service';
import { MachineTypeService } from 'src/app/services/common/models/machine-type.service';
import { QuarryService } from 'src/app/services/common/models/quarry.service';

// Contracts
import { Brand } from 'src/app/contracts/brand/brand';
import { Model } from 'src/app/contracts/model/model';
import { MachineType } from 'src/app/contracts/machine-type/machine-type';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { PageRequest } from 'src/app/contracts/pageRequest';

@Component({
  selector: 'app-machine-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './machine-add.component.html',
  styleUrls: ['./machine-add.component.scss', '../../../../../styles.scss']
})
export class MachineAddComponent extends BaseComponent implements OnInit {

  @Output() createdMachine: EventEmitter<CreateMachine> = new EventEmitter();

  machineForm: FormGroup;
  
  // Data
  brands: Brand[] = [];
  models: Model[] = [];
  machineTypes: MachineType[] = [];
  quarries: Quarry[] = [];
  filteredModels: Model[] = [];
  
  // State
  isSubmitting: boolean = false;
  selectedBrandId: string = '';

  constructor(
    spinner: NgxSpinnerService,
    private machineService: MachineService,
    private brandService: BrandService,
    private modelService: ModelService,
    private machineTypeService: MachineTypeService,
    private quarryService: QuarryService,
    private toastrService: CustomToastrService,
    public router: Router,
    private formBuilder: FormBuilder
  ) {
    super(spinner);
    this.initializeForm();
  }

  async ngOnInit(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      await Promise.all([
        this.loadBrands(),
        this.loadMachineTypes(),
        this.loadQuarries()
      ]);
      
      this.showToastr('Form verileri yüklendi', 'Başarılı', ToastrMessageType.Success);
    } catch (error) {
      console.error('Error loading form data:', error);
      this.showToastr('Form verileri yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
    } finally {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    }
  }

  /**
   * Initialize reactive form
   */
  private initializeForm(): void {
    this.machineForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      serialNumber: ['', [Validators.required, Validators.minLength(3)]],
      brandId: ['', Validators.required],
      modelId: ['', Validators.required],
      machineTypeId: ['', Validators.required],
      quarryId: ['', Validators.required],
      purchaseDate: [''],
      description: ['']
    });

    // Watch brand changes to filter models
    this.machineForm.get('brandId')?.valueChanges.subscribe(brandId => {
      this.onBrandChange(brandId);
    });
  }

  /**
   * Load brands for dropdown
   */
  async loadBrands(): Promise<void> {
    try {
      const response = await this.brandService.list(0, 100);
      this.brands = response.items || [];
      console.log('Brands loaded:', this.brands);
      
      if (this.brands.length === 0) {
        this.showToastr('Sistemde kayıtlı marka bulunamadı', 'Bilgi', ToastrMessageType.Info);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      this.brands = [];
      this.showToastr('Markalar yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
    }
  }

  /**
   * Load all models for dropdown
   */
  async loadAllModels(): Promise<void> {
    try {
      const response = await this.modelService.list(0, 100);
      this.models = response.items || [];
      this.filteredModels = [...this.models];
    } catch (error) {
      console.error('Error loading models:', error);
      this.models = [];
      this.filteredModels = [];
    }
  }

  /**
   * Load machine types for dropdown
   */
  async loadMachineTypes(): Promise<void> {
    try {
      const response = await this.machineTypeService.list(0, 100);
      this.machineTypes = response.items || [];
      console.log('Machine types loaded:', this.machineTypes);
      
      if (this.machineTypes.length === 0) {
        this.showToastr('Sistemde kayıtlı makina tipi bulunamadı', 'Bilgi', ToastrMessageType.Info);
      }
    } catch (error) {
      console.error('Error loading machine types:', error);
      this.machineTypes = [];
      this.showToastr('Makina tipleri yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
    }
  }

  /**
   * Load quarries for dropdown
   */
  async loadQuarries(): Promise<void> {
    try {
      const response = await this.quarryService.list(0, 100);
      this.quarries = response.items || [];
      console.log('Quarries loaded:', this.quarries);
      
      if (this.quarries.length === 0) {
        this.showToastr('Sistemde kayıtlı ocak bulunamadı', 'Bilgi', ToastrMessageType.Info);
      }
    } catch (error) {
      console.error('Error loading quarries:', error);
      this.quarries = [];
      this.showToastr('Ocaklar yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
    }
  }

  /**
   * Handle brand change to filter models
   */
  async onBrandChange(brandId: string): Promise<void> {
    this.selectedBrandId = brandId;
    this.machineForm.get('modelId')?.setValue(''); // Reset model selection
    
    if (brandId) {
      this.showSpinner(SpinnerType.BallSpinClockwise);
      try {
        // Load models for selected brand using API endpoint
        const response = await this.modelService.listByBrandId(brandId);
        this.filteredModels = response.items || [];
        console.log('Filtered models:', this.filteredModels);
        
        if (this.filteredModels.length === 0) {
          this.showToastr('Seçilen marka için model bulunamadı', 'Bilgi', ToastrMessageType.Info);
        }
      } catch (error) {
        console.error('Error loading models for brand:', error);
        this.filteredModels = [];
        this.showToastr('Modeller yüklenirken hata oluştu', 'Hata', ToastrMessageType.Error);
      } finally {
        this.hideSpinner(SpinnerType.BallSpinClockwise);
      }
    } else {
      this.filteredModels = [];
    }
  }

  /**
   * Submit form to create new machine
   */
  async addMachine(): Promise<void> {
    if (this.machineForm.invalid) {
      this.markFormGroupTouched(this.machineForm);
      this.showToastr('Lütfen gerekli alanları doldurun', 'Uyarı', ToastrMessageType.Warning);
      return;
    }

    this.isSubmitting = true;
    
    try {
      const formValue = this.machineForm.value;
      
      // Get names from IDs
      const selectedBrand = this.brands.find(b => b.id === formValue.brandId);
      const selectedModel = this.filteredModels.find(m => m.id === formValue.modelId);
      const selectedMachineType = this.machineTypes.find(mt => mt.id === formValue.machineTypeId);
      const selectedQuarry = this.quarries.find(q => q.id === formValue.quarryId);

      const createMachine: CreateMachine = {
        name: formValue.name.trim(),
        serialNumber: formValue.serialNumber.trim(),
        brandId: formValue.brandId,
        brandName: selectedBrand?.name || '',
        modelId: formValue.modelId,
        modelName: selectedModel?.name || '',
        machineTypeId: formValue.machineTypeId,
        machineTypeName: selectedMachineType?.name || '',
        quarryId: formValue.quarryId,
        quarryName: selectedQuarry?.name || ''
      };

      await this.machineService.add(createMachine);
      
      this.showToastr(
        `${createMachine.name} başarıyla eklendi`, 
        'Başarılı', 
        ToastrMessageType.Success
      );
      
      this.createdMachine.emit(createMachine);
      
      // Navigate back to machines list after delay
      setTimeout(() => {
        this.router.navigate(['/makinalar/makina-listesi']);
      }, 1500);
      
    } catch (error) {
      console.error('Machine creation error:', error);
      this.showToastr('Makina kaydı sırasında hata oluştu', 'Hata', ToastrMessageType.Error);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.machineForm.reset();
    this.filteredModels = [];
    this.selectedBrandId = '';
    this.showToastr('Form temizlendi', 'Bilgi', ToastrMessageType.Info);
  }

  /**
   * Navigate back to machines list
   */
  goBack(): void {
    this.router.navigate(['/makinalar']);
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Check if form field has error
   */
  hasFieldError(fieldName: string, errorType?: string): boolean {
    const field = this.machineForm.get(fieldName);
    if (errorType) {
      return field ? field.hasError(errorType) && field.touched : false;
    }
    return field ? field.invalid && field.touched : false;
  }

  /**
   * Get field error message
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.machineForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} gereklidir`;
    if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} en az ${field.errors['minlength'].requiredLength} karakter olmalıdır`;
    
    return 'Geçersiz değer';
  }

  /**
   * Get display name for field
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Makina adı',
      serialNumber: 'Seri numarası',
      brandId: 'Marka',
      modelId: 'Model',
      machineTypeId: 'Makina tipi',
      quarryId: 'Ocak'
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Show toast notification
   */
  private showToastr(message: string, title: string, type: ToastrMessageType): void {
    this.toastrService.message(message, title, new ToastrOptions(type, ToastrPosition.TopRight));
  }

  /**
   * Get machine icon based on type
   */
  getMachineIcon(machineTypeName: string): string {
    const type = machineTypeName?.toLowerCase();
    
    if (type?.includes('ekskavatör') || type?.includes('excavator')) {
      return 'fas fa-tractor';
    } else if (type?.includes('kamyon') || type?.includes('truck')) {
      return 'fas fa-truck';
    } else if (type?.includes('dozer') || type?.includes('bulldozer')) {
      return 'fas fa-bulldozer';
    } else if (type?.includes('loader')) {
      return 'fas fa-truck-loading';
    }
    
    return 'fas fa-cogs';
  }

  /**
   * Get selected brand name for preview
   */
  getSelectedBrandName(): string {
    const selectedBrand = this.brands.find(brand => brand.id === this.selectedBrandId);
    return selectedBrand?.name || '';
  }
}