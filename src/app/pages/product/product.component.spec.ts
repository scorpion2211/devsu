import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductComponent } from './product.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from 'src/app/services/products/products.service';
import { BehaviorSubject, of } from 'rxjs';
import { IDataRecord } from 'src/app/shared/utils/records.interface';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { MOCK_RECORDS } from 'src/app/shared/utils/mocks';
import { EAlertType } from 'src/app/shared/utils/alert-type.enum';
import { message$ } from 'src/app/shared/components/alert/alert.component';
import { loading$ } from 'src/app/shared/components/loading/loading.component';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;
  let productsService: any;

  beforeEach(async () => {
    const editableProductSubject = new BehaviorSubject<IDataRecord | null>(null);

    const productServiceSpyObj = jasmine.createSpyObj('ProductsService', [
      'addProduct',
      'verifyID',
      'updateProduct',
    ]);

    productServiceSpyObj.editableProduct$ = editableProductSubject.asObservable();

    productServiceSpyObj.addProduct.and.returnValue(of(MOCK_RECORDS[0]));
    productServiceSpyObj.verifyID.and.returnValue(of(true));
    productServiceSpyObj.updateProduct.and.returnValue(of(MOCK_RECORDS[0]));

    productsService = productServiceSpyObj;

    await TestBed.configureTestingModule({
      declarations: [ProductComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, ButtonModule],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'edit' } } } },
        { provide: ProductsService, useValue: productServiceSpyObj },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and load params on ngOnInit', () => {
    spyOn(component, 'initializeForm').and.callThrough();
    spyOn(component, 'loadParams').and.callThrough();

    component.ngOnInit();

    expect(component.initializeForm).toHaveBeenCalled();
    expect(component.loadParams).toHaveBeenCalled();
    expect(component.isEditMode).toBeTrue();
    expect(loading$.value).toBeFalse();
  });

  it('should initialize form', () => {
    component.initializeForm();
    expect(component.productForm).toBeDefined();
  });

  it('should load editable product', () => {
    const productData: IDataRecord | null = null;
    const editableProductSubject = new BehaviorSubject<IDataRecord | null>(productData);
    productsService.editableProduct$ = editableProductSubject.asObservable();

    editableProductSubject.next(productData);
    component.loadEditableProduct();

    expect(component.getProductData()).toEqual(productData);
  });

  it('should populate form with data', () => {
    const productData: IDataRecord = MOCK_RECORDS[0];
    component.populateFormWithData(productData);
    expect(component.productForm.value).toEqual(productData);
  });

  it('should fix date', () => {
    const date_release = '2024-05-01';
    const date_revision = '2025-05-01';
    component.initializeForm();
    component.fixDate(date_release, date_revision);
    const dateReleaseControl = component.productForm.get('date_release');
    const dateRevisionControl = component.productForm.get('date_revision');
    expect(dateReleaseControl?.value).toBe(new Date(date_release).toISOString().split('T')[0]);
    expect(dateRevisionControl?.value).toBe(new Date(date_revision).toISOString().split('T')[0]);
  });

  it('should submit form in add mode', fakeAsync(() => {
    spyOn(component, 'resetForm').and.callThrough();
    component.isEditMode = false;
    component.initializeForm();
    component.productForm.setValue(MOCK_RECORDS[0]);
    productsService.verifyID.and.returnValue(of(false));
    component.onSubmit();
    tick(100);
    expect(component.resetForm).toHaveBeenCalled();
  }));

  it('should submit form in edit mode', fakeAsync(() => {
    spyOn(component, 'resetForm').and.callThrough();
    component.isEditMode = true;
    component._productData = MOCK_RECORDS[0];
    component.initializeForm();
    component.productForm.setValue(MOCK_RECORDS[0]);
    component.onSubmit();
    tick(100);
    expect(component.resetForm).toHaveBeenCalled();
  }));

  it('should show alert when trying to edit existing product ID', () => {
    const alertServiceSpy = spyOn(message$, 'next');
    component.isEditMode = true;
    component._productData = MOCK_RECORDS[0];

    const data = { ...MOCK_RECORDS[0], id: 'test1' };
    component.initializeForm();
    component.productForm.setValue(data);

    component.onSubmit();

    expect(alertServiceSpy).toHaveBeenCalledWith({
      description: `No se permite editar el ID de un producto existente`,
      type: EAlertType.INFO,
    });
    expect(component.productForm.get('id')?.value).toBe(MOCK_RECORDS[0].id);
  });

  it('should return form controls', () => {
    const formBuilder = new FormBuilder();
    component.productForm = formBuilder.group({
      id: ['1'],
      name: ['Product 1'],
      description: ['Description 1'],
    });
    const controls = component.formControls;
    expect(controls['id']).toBeDefined();
    expect(controls['name']).toBeDefined();
    expect(controls['description']).toBeDefined();
  });
});
