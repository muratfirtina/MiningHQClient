import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployePhotoDialogComponent } from './employe-photo-dialog.component';

describe('EmployePhotoDialogComponent', () => {
  let component: EmployePhotoDialogComponent;
  let fixture: ComponentFixture<EmployePhotoDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployePhotoDialogComponent]
    });
    fixture = TestBed.createComponent(EmployePhotoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
