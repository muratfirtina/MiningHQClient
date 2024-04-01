import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeImageDialogComponent } from './employe-image-dialog.component';

describe('EmployeImageDialogComponent', () => {
  let component: EmployeImageDialogComponent;
  let fixture: ComponentFixture<EmployeImageDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeImageDialogComponent]
    });
    fixture = TestBed.createComponent(EmployeImageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
