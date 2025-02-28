import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products/products.service';
import { IDataRecord } from 'src/app/shared/utils/records.interface';
import { EAlertType } from 'src/app/shared/utils/alert-type.enum';
import { ETypesButton } from 'src/app/shared/utils/type-button.enum';
import { ESizeModal } from 'src/app/shared/utils/modal-size.enum';
import { Router } from '@angular/router';
import { of, switchMap, take } from 'rxjs';
import { message$ } from 'src/app/shared/components/alert/alert.component';
import { loading$ } from 'src/app/shared/components/loading/loading.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public typeButton = ETypesButton;
  public searchTerm = '';
  public itemSelected: IDataRecord | null = null;
  public showModalConfirm = false;
  public showActionsTester = false;
  public showModalDescription = false;
  public sizeModal = ESizeModal;
  public isLoadingTable = false;
  public totalProducts = 0;
  public totalData: IDataRecord[] = [];

  constructor(
    private productsService: ProductsService,
    public router: Router,
  ) {}

  ngOnInit() {
    /**
     * If the ID is empty or has few products, uncomment this line to load products
     */
    //this.productsService.pushRandomProducts();
    this.isLoadingTable = true;
    this.loadProducts();
  }

  debuggerActions(clear = false) {
    loading$.next(true);
    clear && this.totalData.length > 0
      ? this.productsService.removeAllProducts(this.totalData)
      : this.productsService.pushRandomProducts();

    setTimeout(() => {
      this.loadProducts();
    }, 3000);
  }

  loadProducts() {
    this.productsService
      .getProducts()
      .pipe(take(1))
      .subscribe({
        next: ({ data }) => {
          data = this.sortData(data);
          this.totalData = data;

          /**
           * If you want to clear the list for some reason, uncomment the following line
           */
          //this.productsService.removeAllProducts(data);

          /**
           * A timer is set so that the skeleton for the exercise can be appreciated
           */
          setTimeout(() => {
            this.isLoadingTable = false;
            loading$.next(false);
          }, 2000);
        },
      });
  }

  sortData(data: IDataRecord[]) {
    return data.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  selectItemToBeDeleted(item: IDataRecord) {
    this.itemSelected = item;
    this.showModalConfirm = true;
  }

  deleteProduct() {
    if (this.itemSelected) {
      loading$.next(true);
      const item = { ...this.itemSelected };
      this.productsService
        .verifyID(item.id)
        .pipe(
          take(1),
          switchMap((exist) => {
            if (exist) {
              return this.productsService.deleteProduct(item.id).pipe(take(1));
            }
            message$.next({
              description: `El producto ${item.name} no existe`,
              type: EAlertType.WARNING,
            });
            return of();
          }),
        )
        .subscribe({
          next: () => {
            message$.next({
              description: `Producto ${item.name} eliminado`,
              type: EAlertType.SUCCESS,
            });
            this.searchTerm = '';
            this.loadProducts();
          },
          complete: () => {
            this.itemSelected = null;
            this.showModalConfirm = false;
          },
        });
    }
  }

  editProduct(item: IDataRecord) {
    this.productsService.editableProduct$.next(item);
    this.router.navigateByUrl('/product/edit');
  }
}
