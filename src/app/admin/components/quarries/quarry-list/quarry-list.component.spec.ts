import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarryListComponent } from './quarry-list.component';

describe('QuarryListComponent', () => {
  let component: QuarryListComponent;
  let fixture: ComponentFixture<QuarryListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuarryListComponent]
    });
    fixture = TestBed.createComponent(QuarryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
