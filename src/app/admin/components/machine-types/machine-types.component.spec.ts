import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineTypesComponent } from './machine-types.component';

describe('MachineTypesComponent', () => {
  let component: MachineTypesComponent;
  let fixture: ComponentFixture<MachineTypesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MachineTypesComponent]
    });
    fixture = TestBed.createComponent(MachineTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
