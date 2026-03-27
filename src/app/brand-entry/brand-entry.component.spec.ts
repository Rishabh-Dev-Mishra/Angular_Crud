import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandEntryComponent } from './brand-entry.component';

describe('BrandEntryComponent', () => {
  let component: BrandEntryComponent;
  let fixture: ComponentFixture<BrandEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
