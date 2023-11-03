import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineTypeListComponent } from './machine-type-list.component';

describe('MachineTypeListComponent', () => {
  let component: MachineTypeListComponent;
  let fixture: ComponentFixture<MachineTypeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MachineTypeListComponent]
    });
    fixture = TestBed.createComponent(MachineTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
