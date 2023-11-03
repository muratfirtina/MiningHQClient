import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineTypeAddComponent } from './machine-type-add.component';

describe('MachineTypeAddComponent', () => {
  let component: MachineTypeAddComponent;
  let fixture: ComponentFixture<MachineTypeAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MachineTypeAddComponent]
    });
    fixture = TestBed.createComponent(MachineTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
