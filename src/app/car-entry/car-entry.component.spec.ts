import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarEntryComponent } from './car-entry.component';

describe('CarEntryComponent', () => {
  let component: CarEntryComponent;
  let fixture: ComponentFixture<CarEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
