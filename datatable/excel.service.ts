import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { DynamicScriptLoader } from '../utils/dynamic-load-script';
// import * as XLSX from 'xlsx';
declare var XLSX: any;

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Injectable()
export class ExcelService {
  private dynamicScriptLoader = new DynamicScriptLoader();

  constructor() { }
  
  public exportAsExcelFile(json: any[], excelFileName: string): void {
    let self = this;
    this.dynamicScriptLoader.loadScripts([{ name: 'xlsx.js', src: 'assets/js/xlsx.full.min.js', element: 'script' }],
      ()=> self.exportAsExcelFile_after(json, excelFileName));
  }

  public exportAsExcelFile_after(json: any[], excelFileName: string): void {
    const worksheet = XLSX.utils.json_to_sheet(json);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

}