import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitledLeaveComponent } from './entitled-leave.component';

describe('EntitledLeaveComponent', () => {
  let component: EntitledLeaveComponent;
  let fixture: ComponentFixture<EntitledLeaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EntitledLeaveComponent]
    });
    fixture = TestBed.createComponent(EntitledLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
