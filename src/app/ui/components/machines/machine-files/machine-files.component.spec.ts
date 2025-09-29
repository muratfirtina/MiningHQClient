import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineFilesComponent } from './machine-files.component';

describe('MachineFilesComponent', () => {
  let component: MachineFilesComponent;
  let fixture: ComponentFixture<MachineFilesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MachineFilesComponent]
    });
    fixture = TestBed.createComponent(MachineFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
