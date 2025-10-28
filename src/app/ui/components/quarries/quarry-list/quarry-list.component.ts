import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { Quarry } from 'src/app/contracts/quarry/quarry';
import { ListQuarry } from 'src/app/contracts/quarry/list-quarry';
import { QuarryService } from 'src/app/services/common/models/quarry.service';

@Component({
  selector: 'app-quarry-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './quarry-list.component.html',
  styleUrls: ['./quarry-list.component.scss']
})
export class QuarryListComponent extends BaseComponent implements OnInit {
  
  quarries: Quarry[] = [];
  filteredQuarries: Quarry[] = [];
  searchForm: FormGroup;
  
  currentPageNo: number = 1;
  pageSize: number = 10;
  pages: number = 1;
  pageList: number[] = [];

  constructor(
    spinner: NgxSpinnerService,
    private quarryService: QuarryService,
    private router: Router,
    private fb: FormBuilder
  ) {
    super(spinner);
    
    this.searchForm = this.fb.group({
      nameSearch: [''],
      location: [''],
      sortDirection: ['asc']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadQuarries();
  }

  async loadQuarries(): Promise<void> {
    this.showSpinner(SpinnerType.BallSpinClockwise);
    
    try {
      const data: ListQuarry = await this.quarryService.list(-1, -1);
      this.quarries = data.items;
      this.filteredQuarries = [...this.quarries];
      this.calculatePagination();
      this.hideSpinner(SpinnerType.BallSpinClockwise);
    } catch (error) {
      this.hideSpinner(SpinnerType.BallSpinClockwise);
      console.error('Ocaklar yüklenirken hata:', error);
    }
  }

  searchQuarries(): void {
    const formValue = this.searchForm.value;
    
    this.filteredQuarries = this.quarries.filter(quarry => {
      const nameMatch = !formValue.nameSearch || 
        quarry.name.toLowerCase().includes(formValue.nameSearch.toLowerCase());
      
      const locationMatch = !formValue.location || 
        (quarry.location && quarry.location.toLowerCase().includes(formValue.location.toLowerCase()));
      
      return nameMatch && locationMatch;
    });

    // Sort
    if (formValue.sortDirection === 'desc') {
      this.filteredQuarries.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      this.filteredQuarries.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.currentPageNo = 1;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.pages = Math.ceil(this.filteredQuarries.length / this.pageSize);
    this.pageList = Array.from({ length: Math.min(this.pages, 7) }, (_, i) => {
      if (this.pages <= 7) return i + 1;
      if (this.currentPageNo <= 4) return i + 1;
      if (this.currentPageNo >= this.pages - 3) return this.pages - 6 + i;
      return this.currentPageNo - 3 + i;
    });
  }

  get paginatedQuarries(): Quarry[] {
    const start = (this.currentPageNo - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredQuarries.slice(start, end);
  }

  changePage(pageNo: number): void {
    if (pageNo < 1 || pageNo > this.pages) return;
    this.currentPageNo = pageNo;
    this.calculatePagination();
  }

  goToQuarryPage(quarryId: string): void {
    this.router.navigate(['/ocaklar/ocak', quarryId]);
  }

  goToQuarryProduction(quarryId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/ocaklar/uretim', quarryId]);
  }

  trackByQuarryId(index: number, quarry: Quarry): string {
    return quarry.id;
  }
}
