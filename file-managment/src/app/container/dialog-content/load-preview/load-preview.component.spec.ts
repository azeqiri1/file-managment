import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadPreviewComponent } from './load-preview.component';

describe('LoadPreviewComponent', () => {
  let component: LoadPreviewComponent;
  let fixture: ComponentFixture<LoadPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
