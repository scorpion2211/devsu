import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductsService } from 'src/app/services/products/products.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ETypesButton } from 'src/app/shared/utils/type-button.enum';
import { ESizeModal } from 'src/app/shared/utils/modal-size.enum';
import { AppModule } from 'src/app/app.module';
import { TableModule } from 'src/app/shared/components/table/table.module';
import { ModalModule } from 'src/app/shared/components/modal/modal.module';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { IDataRecord } from 'src/app/shared/utils/records.interface';
import { MOCK_RECORDS } from 'src/app/shared/utils/mocks';
import { of } from 'rxjs';
import { EAlertType } from 'src/app/shared/utils/alert-type.enum';
import { Router } from '@angular/router';
import { message$ } from 'src/app/shared/components/alert/alert.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let loadingService: LoadingService;
  let productsService: ProductsService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        AppModule,
        TableModule,
        ModalModule,
        FormsModule,
        ButtonModule,
      ],
      providers: [ProductsService, LoadingService],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    loadingService = TestBed.inject(LoadingService);
    productsService = TestBed.inject(ProductsService);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.typeButton).toEqual(ETypesButton);
    expect(component.searchTerm).toEqual('');
    expect(component.itemSelected).toBeNull();
    expect(component.showModalConfirm).toBeFalsy();
    expect(component.showModalDescription).toBeFalsy();
    expect(component.sizeModal).toEqual(ESizeModal);
    expect(component.isLoadingTable).toBeTruthy();
    expect(component.totalData).toEqual([]);
  });

  it('should select item to be deleted', () => {
    const item: IDataRecord = MOCK_RECORDS[0];
    component.selectItemToBeDeleted(item);
    expect(component.itemSelected).toEqual(item);
    expect(component.showModalConfirm).toBeTrue();
  });

  it('should delete product', () => {
    const item: IDataRecord = {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      logo: 'logo1.png',
      date_release: '2024-05-01',
      date_revision: '2024-05-02',
    };
    spyOn(productsService, 'verifyID').and.returnValue(of(true));
    spyOn(productsService, 'deleteProduct').and.returnValue(of(''));
    const alertServiceSpy = spyOn(message$, 'next');

    component.itemSelected = item;
    component.deleteProduct();

    expect(productsService.verifyID).toHaveBeenCalledWith(item.id);
    expect(productsService.deleteProduct).toHaveBeenCalledWith(item.id);
    expect(alertServiceSpy).toHaveBeenCalledWith({
      description: `Producto ${item.name} eliminado`,
      type: EAlertType.SUCCESS,
    });
    expect(component.searchTerm).toEqual('');
    expect(component.isLoadingTable).toBeTruthy();
  });

  it('should navigate to edit product', () => {
    const item: IDataRecord = {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      logo: 'logo1.png',
      date_release: '2024-05-01',
      date_revision: '2024-05-02',
    };
    const routerSpy = spyOn(router, 'navigateByUrl').and.stub();
    const editableProductSpy = spyOn(productsService.editableProduct$, 'next').and.stub();
    component.editProduct(item);
    expect(editableProductSpy).toHaveBeenCalledWith(item);
    expect(routerSpy).toHaveBeenCalledWith('/product/edit');
  });

  it('should load products', fakeAsync(() => {
    const mockProducts = MOCK_RECORDS.slice(0, 2);
    spyOn(productsService, 'getProducts').and.returnValue(of({ data: mockProducts }));
    spyOn(productsService, 'removeAllProducts').and.stub();
    spyOn(message$, 'next').and.stub();
    component.loadProducts();
    expect(productsService.getProducts).toHaveBeenCalled();
    tick(3000);
    expect(component.totalData).toEqual(mockProducts);
  }));

  it('should sort data alphabetically by name when it equals', () => {
    const testData = MOCK_RECORDS.slice(0, 3);

    const sortedData = component.sortData(testData);

    expect(sortedData).toEqual(MOCK_RECORDS.slice(0, 3));
  });

  it('should sort data alphabetically by name', () => {
    const testData = MOCK_RECORDS.slice(0, 3).reverse();

    const sortedData = component.sortData(testData);

    expect(sortedData).toEqual(MOCK_RECORDS.slice(0, 3));
  });

  it('should sort data alphabetically by name and contina equals elements', () => {
    const testData = [MOCK_RECORDS[0], MOCK_RECORDS[0]];

    const sortedData = component.sortData(testData);

    expect(sortedData).toEqual([MOCK_RECORDS[0], MOCK_RECORDS[0]]);
  });

  it('should set isLoadingTable to false after 4 seconds', fakeAsync(() => {
    spyOn(productsService, 'pushRandomProducts').and.stub();
    const loadinSpy = spyOn(loadingService.loading$, 'next');
    component.debuggerActions();
    expect(loadinSpy).toHaveBeenCalledWith(true);
    expect(productsService.pushRandomProducts).toHaveBeenCalledWith();
    tick(3000);
    expect(loadinSpy).toHaveBeenCalledWith(false);
  }));

  it('should remove all products', fakeAsync(() => {
    spyOn(productsService, 'removeAllProducts').and.stub();
    const loadinSpy = spyOn(loadingService.loading$, 'next');
    component.totalData = MOCK_RECORDS;
    component.debuggerActions(true);
    expect(loadinSpy).toHaveBeenCalledWith(true);
    expect(productsService.removeAllProducts).toHaveBeenCalledWith(component.totalData);
    tick(3000);
    expect(loadinSpy).toHaveBeenCalledWith(false);
  }));
});
