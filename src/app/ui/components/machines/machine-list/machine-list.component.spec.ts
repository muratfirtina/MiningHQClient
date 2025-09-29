import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineListComponent } from './machine-list.component';

describe('MachineListComponent', () => {
  let component: MachineListComponent;
  let fixture: ComponentFixture<MachineListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachineListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MachineListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load machines on init', () => {
    expect(component.items).toBeDefined();
  });

  it('should filter machines based on search term', () => {
    component.originalItems = [
      { name: 'Test Machine', brandName: 'CAT' } as any,
      { name: 'Another Machine', brandName: 'Volvo' } as any
    ];
    component.items = [...component.originalItems];

    const event = { target: { value: 'Test' } } as any;
    component.searchMachines(event);

    expect(component.items.length).toBe(1);
    expect(component.items[0].name).toBe('Test Machine');
  });

  it('should return correct machine icon for excavator', () => {
    const icon = component.getMachineIcon('Ekskavatör');
    expect(icon).toBe('fas fa-tractor');
  });

  it('should identify featured machines correctly', () => {
    const catMachine = { brandName: 'Caterpillar' } as any;
    const otherMachine = { brandName: 'Other Brand' } as any;

    expect(component.isFeaturedMachine(catMachine)).toBeTruthy();
    expect(component.isFeaturedMachine(otherMachine)).toBeFalsy();
  });
});
