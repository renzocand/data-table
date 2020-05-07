//Native Imports
import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {FormsModule,ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from '@angular/common';
//import {SmartadminModule} from "../../shared/smartadmin.module";
//import {SmartadminInputModule} from "../../shared/forms/input/smartadmin-input.module";
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
//Components Imports
import {DatatableComponent} from "./datatable.component";
import { ExcelService } from "./excel.service";
import { MgrPipeModule } from "./../../core/pipe/mgr-pipe.module";
//import { CronService } from "app/+seguimiento/+jobs/cron.service";


@NgModule({
  //Declarations
  declarations: [
    DatatableComponent,
  ],
  //Imports
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    //SmartadminModule,
    //SmartadminInputModule,
    MgrPipeModule,
    VirtualScrollerModule,
  ],
  //Exports
  exports: [
    DatatableComponent
  ],
  providers: [ExcelService,
    //CronService
  ]
})

export class DatatableModule {}
