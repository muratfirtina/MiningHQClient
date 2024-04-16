import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeFileDialogComponent } from './employe-file-dialog.component';

describe('EmployeImageDialogComponent', () => {
  let component: EmployeFileDialogComponent;
  let fixture: ComponentFixture<EmployeFileDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeFileDialogComponent]
    });
    fixture = TestBed.createComponent(EmployeFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
