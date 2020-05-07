//###############################################################################################################
//#                                              MODULO DATATABLES                                              #
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
//# DESCRIPCION:                                                                                                #
//# MODULO QUE PERMITE IMPLEMENTAR LA FUNCIONALIDAD DE DATATABLES EN CUALQUIER ARREGLO DE OBJETOS.              #
//# EL MISMO GENERA 3 EVENTOS PARA GESTIONAR EL EDIT, DELETE, Y VIEW DESDE EL MODULO PADRE.                     #
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
//# VERSION: 1.0.1                                                                                              #
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
//# AUTOR: MAKOTO KATSUMATA 11/25/2017                                                                          #
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
//# CAMBIOS:                                                                                                    #
//# 1.0.1. MAKOTO KATSUMATA 11/26/2017: SE AGREGO TOEXCEL Y TOPDF                                               #
//###############################################################################################################


//##########################
//# INICIO # IMPORTACIONES #

import { Component, OnInit, Input, Output, IterableDiffers, DoCheck, EventEmitter, Renderer2, Inject } from '@angular/core';
import { ExcelService } from './excel.service';

// import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
declare var pdfMake: any;
// declare var pdfFonts: any;
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

// import { PERSONS, Person } from './model';
import { DOCUMENT } from '@angular/common';
import { get_logo } from './pdf.logo.component';
import { DynamicScriptLoader } from '../utils/dynamic-load-script';
//import { CronService } from 'app/+seguimiento/+jobs/cron.service';
import { default as swal } from 'sweetalert2'


//# INICIO # IMPORTACIONES #
//##########################


//#################################################
//# INICIO # DECLARACION COMPONENTE DE DATATABLES #

@Component({
  selector: 'mgr-datatable',
  templateUrl: './datatable.template.html',
  styleUrls: ['./datatable.style.css']
})

//# FINAL  # DECLARACION COMPONENTE DE DATATABLES #
//#################################################



//#################################
//# INICIO # MODULO DE DATATABLES #

export class DatatableComponent implements OnInit, DoCheck {
  //###################
  //# INICIO # INPUTS #

  //# options: Controla los cambios dentro del INPUT de options. Cuando hay un cambio asigna el valor del offsetView y actualiza los offsets de paginación
  @Input() set options(option: any) {
    this.options_value = option;
    this.options_value.show_after_header_table = option.show_after_header_table === false ? false : true;
    this.options_value.show_widget_footer = option.show_widget_footer === false ? false : true;
    this.offsetView = this.options_value.navigation_offsets[this.options_value.navigation_starting_offset_index];
    this.options_value.responsive_y = option.responsive_y ? true : false;
    this.options_value.columns_headers_title = option.columns_headers_title || option.columns.map(i => '');
    this.options_value.columns_headers_checkbox = option.columns_headers_checkbox || false;
    this.options_value.columns_headers_checkbox_event = option.columns_headers_checkbox_event || option.columns.map(i => false);
    this.options_value.columns_headers_radio = option.columns_headers_radio || false;
    this.options_value.columns_headers_radio_event = option.columns_headers_radio_event || option.columns.map(i => false);
    this.options_value.combobox_show = option.combobox_show || false;
    this.options_value.combobox_show_array = (option.combobox_show_array && option.combobox_show_array.length > 0) ? option.combobox_show_array : [];
    this.options_value.hide_bar_header = option.hide_bar_header ? option.hide_bar_header : false;
    this.options_value.columns_context_menu = option.columns_context_menu || option.columns.map(i => false);
    this.options_value.id = option.id || 'table_ref';
    this.options_value.columns_style = option.columns_style || option.columns.map(i => '');
    this.options_value.color_theme = option.color_theme || 'darken';
    this.options_value.columns_aline = option.columns_aline || option.columns.map(i => '');
    this.options_value.columns_child_active = option.columns_child_active || false;
    this.options_value.columns_style_body = option.columns_style_body || option.columns.map(i => '');
    this.options_value.show_number_elements = option.show_number_elements || false;
    this.options_value.row_marked = option.row_marked || null;
    this.options_value.pagination_external = option.pagination_external || false;
    this.options_value.pagination_external_non_style = option.pagination_external_non_style || false;
    this.options_value.columns_format_decimal = option.columns_format_decimal || option.columns.map(i => false);
    this.options_value.pipes = option.pipes || option.columns.map(i => '');
    this.options_value.title_td = option.title_td || option.columns.map(i => '');
    this.options_value.customClass = option.customClass || '';
    this.update_offsets();
  }
  @Input() set pagination_external(paginacion: any) {
    if (this.options_value.pagination_external) {
      this.pagination_external_value = paginacion;
      this.pag_reference_external = [];
      let paginate: any = (e, t = 1, a = 10, r = 10) => { let l, s, n = Math.ceil(e / a); if (t < 1 ? t = 1 : t > n && (t = n), n <= r) l = 1, s = n; else { let e = Math.floor(r / 2), a = Math.ceil(r / 2) - 1; t <= e ? (l = 1, s = r) : t + a >= n ? (l = n - r + 1, s = n) : (l = t - e, s = t + a) } let g = (t - 1) * a, i = Math.min(g + a - 1, e - 1), o = Array.from(Array(s + 1 - l).keys()).map(e => l + e); return { totalItems: e, currentPage: t, pageSize: a, totalPages: n, startPage: l, endPage: s, startIndex: g, endIndex: i, pages: o } };
      const pgenerada = paginate(paginacion.number_records, paginacion.page, paginacion.size, 8);
      this.pag_reference_external = pgenerada.pages.map(i => {
        return i;
      });
      this.page_end = pgenerada.totalPages;
    };
  }

  //# loading: Referencia a la variable que controla el spinner de carga (se pasa del componente padre por referencia)
  @Input() loading: any;

  //# loading: Referencia a la variable que controla el spinner de carga del botton de borrar(se pasa del componente padre por referencia)
  @Input() loading_delete: any;

  //# loading: Referencia a la variable que controla el spinner de carga del botton de ver(se pasa del componente padre por referencia)
  @Input() loading_view: any;

  //# loading: Referencia a la variable que controla el spinner de carga del botton de word(se pasa del componente padre por referencia)
  @Input() loading_word: any;

  //# loading: Referencia a la variable que controla el spinner de carga del botton de excel(se pasa del componente padre por referencia)
  @Input() loading_excel: any;

  //# loading: Referencia a la variable que controla el spinner de carga del botton de editar(se pasa del componente padre por referencia)
  @Input() loading_edit: any;

  //# loading: Referencia a la variable que controla el spinner de carga del botton de editar(se pasa del componente padre por referencia)
  @Input() loading_button_custom1: any;

  //# data_array: Arreglo de objetos a utilizar en la tabla. Es enviado por el component padre
  @Input() data_array: any[];

  @Input() set_page_selected: number = 1;

  // @Input() row_marked: string | number = null;

  //# FINAL  # INPUTS #
  //###################

  //####################
  //# INICIO # EVENTOS #

  //# delete: Transmite un evento de tipo DELETE al padre cuando se llama la función de borrar en un registro de la tabla
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();

  //# view: Transmite un evento de tipo WORD al padre cuando se llama la función de ver en un registro de la tabla
  @Output() word: EventEmitter<any> = new EventEmitter<any>();

  //# view: Transmite un evento de tipo EXCEL al padre cuando se llama la función de ver en un registro de la tabla
  @Output() excel: EventEmitter<any> = new EventEmitter<any>();

  //# edit: Transmite un evento de tipo EDIT al padre cuando se llama la función de editar en un registro de la tabla
  @Output() button_custom1: EventEmitter<any> = new EventEmitter<any>();

  //# view: Transmite un evento de tipo VIEW al padre cuando se llama la función de ver en un registro de la tabla
  @Output() view: EventEmitter<any> = new EventEmitter<any>();

  //# edit: Transmite un evento de tipo EDIT al padre cuando se llama la función de editar en un registro de la tabla
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();

  //# column: Transmite un evento de tipo COLUMNA al padre cuando se llama una columna de tipo evento
  @Output() column: EventEmitter<any> = new EventEmitter<any>();

  @Output() checkbox: EventEmitter<any> = new EventEmitter<any>();

  @Output() checkbox_ambitos: EventEmitter<any> = new EventEmitter<any>();

  @Output() checkbox_all: EventEmitter<any> = new EventEmitter<any>();

  @Output() checkbox_colum: EventEmitter<any> = new EventEmitter<any>();

  @Output() radio_column: EventEmitter<any> = new EventEmitter<any>();

  @Output() combobox: EventEmitter<any> = new EventEmitter<any>();

  @Output() get_page_selected: EventEmitter<number> = new EventEmitter<number>();

  @Output() row_event: EventEmitter<number> = new EventEmitter<number>();

  @Output() get_page_size: EventEmitter<number> = new EventEmitter<number>();

  @Output() page_external_select: EventEmitter<number> = new EventEmitter<number>();



  @Output() play_cron: EventEmitter<any> = new EventEmitter<any>();
  @Output() stop_cron: EventEmitter<any> = new EventEmitter<any>();


  //# FINAL  # EVENTOS #
  //####################


  //######################
  //# INICIO # VARIABLES #

  //# options_value: Almacena la referencia al objeto de options pasado por el componente padre
  public options_value: any;

  public pagination_external_value: any;

  public pagination_external_obj: any

  public page_end: number;

  //# order: Almacena la columna que se está ordenando (se cambia cuando el usuario da clic en otra columna para ordenar)
  public order: string;

  //# ascendent: Almacena si la columna se está ordenando de forma ascendente. En caso de ser falsa, la columna se ordena de forma descendiente
  public ascendent: boolean;

  //# requestOffsetRight: Almacena una referencia del límite derecho del sistema de paginación
  public requestOffsetRight: number;

  //# requestOffsetLeft: Almacena una referencia del límite izquierdo del sistema de paginación
  public requestOffsetLeft: number;

  //# offsetView: Almacena el total de registros a mostrar por cada paginación de la tabla
  public offsetView: number;

  //# displaying: Almacena una referencia del total de elementos mostrados (se utiliza para un ngFor en el template, que se encarga de mostrar los registros)
  public displaying: string[];

  //# resultados: Almacena el arreglo de objetos referenciado por el component padre
  public resultados: any[];

  //# static_resultados: Almacena una referencia estática del arreglo de objetos referenciado por el padre
  public static_resultados: any[];

  //# search_word: Almacena la palabra ingresa en el campo de filtro
  public search_word: string;

  //# filtering: Almacena el estado de filtro. Si existe un filtro aplicado, la variable es TRUE
  public filtering: boolean;

  //# pag_reference: Almacena una referencia del total de botones de paginación (se utiliza para un ngFor en el template, que se encarga de mostrar los botones de paginación)
  public pag_reference: string[];

  public pag_reference_external: string[];

  public loaded_wjs: boolean;

  //# differ: Variable de referencia utilizada para detectar cambios en un arreglo (Sólo funciona para variables pasadas por referencia)
  private differ: any;

  public child_index_show: number;

  public index_clicked: number;

  public show_clicked: number;

  private dynamicScriptLoader = new DynamicScriptLoader();
  //# FINAL  # VARIABLES #
  //######################


  //########################
  //# INICIO # CONSTRUCTOR #
  //private cronService: CronService
  constructor( private _iterableDiffers: IterableDiffers, private excelService: ExcelService, private renderer2: Renderer2, @Inject(DOCUMENT) private _document) {
    this.index_clicked = -1;
    this.show_clicked = -1;
    this.offsetView = 0;
    this.order = "";
    this.ascendent = false;
    this.filtering = false;
    this.requestOffsetRight = 0;
    this.requestOffsetLeft = 0;
    this.displaying = [];
    this.search_word = "";
    this.resultados = [];
    this.differ = this._iterableDiffers.find([]).create(null);
    this.pag_reference = [];
    this.excelService = excelService;
    this.loaded_wjs = false;
    this.child_index_show = -1;
  }



  data_tabla(data1, data2) {
    console.log("data1->", data1);
    console.log("data2->", data2);


  }
  //# FINAL  # CONSTRUCTOR #
  //########################


  //###################
  //# INICIO # LOGICA #

  //# ngOnInit(): Método que ejecuta la lógica en el ciclo de inicio de Angular
  ngOnInit() {
  }

  //# AfterViewInit(): Método que ejecuta la lógica en el ciclo posterior al inicio de Angular
  AfterViewInit() {
    this.resultados = this.data_array;
    this.pag_reference = [];
    for (var i = 0; i < this.resultados.length / this.offsetView; i++) {
      this.pag_reference.push(' ');
    }
    this.update_offsets();
    // this.pagination_navigation(this.get_page_selected);
  }

  //# ngDoCheck(): Método que ejecuta la lógica en el ciclo de cambios de Angular. El mismo verifica si el arreglo de datos ha cambiado y actualiza las variables correspondientes en caso de haberlo hecho
  ngDoCheck() {
    let changes = this.differ.diff(this.data_array);
    if (changes) {
      this.search_word = '';
      this.resultados = this.data_array;
     // console.log("resultados-->", this.data_array);
      this.update_offsets();
      this.pag_reference = [];
      for (var i = 0; i < this.resultados.length / this.offsetView; i++) {
        this.pag_reference.push(' ');
      }
    }
  }

  //# onChangeSelection(selected): Método que recibe el total de registros a mostrar por paginación, los asigna a la variable correspondiente, y actualiza el arreglo de referencia para el ngFor
  onChangeSelection(selected) {
    this.offsetView = parseInt(selected);
    this.pag_reference = [];
    for (var i = 0; i < this.resultados.length / this.offsetView; i++) {
      this.pag_reference.push(' ');
    }
  }

  checkbox_select_all(value) {
    var check_object = { value: value, elements: [] };
    if (value) {
      for (var i = 0; i < this.resultados.length; i++) {
        for (var j = 0; j < this.data_array.length; j++) {
          if (this.data_array[j] == this.resultados[i]) {
            check_object.elements.push(j);
            this.data_array[j].selected = value;
          }
        }
      }
    } else {
      for (var j = 0; j < this.data_array.length; j++) {
        this.data_array[j].selected = value;
      }
    }
    this.checkbox_all.emit(check_object);

  }

  // checkbox_event(value, event) {
  //   for (var i = 0; i < this.data_array.length; i++) {
  //     if (this.data_array[i] == this.resultados[value.index]) {
  //       if(event.path[15].id === 'tab_roles'){
  //         this.checkbox.emit({ index: i, value: value.value, target: event.target });
  //       }
  //       if(event.path[15].id === 'tab_ambitos'){
  //         this.checkbox_ambitos.emit({ index: i, value: value.value, target: event.target });
  //       }
  //       this.data_array[i].selected = value.value;
  //     }
  //   }
  // }


  checkbox_event(value, event, ht) {
    for (var i = 0; i < this.data_array.length; i++) {
      if (this.data_array[i] == this.resultados[value.index]) {
        this.data_array[i].selected = value.value;
        this.checkbox.emit({ index: i, value: value.value });
      }
    }
  }

  checkbox_colum_event(seleccionado: boolean, indice: number, columna: string): void {
    this.checkbox_colum.emit({ index: indice, value: seleccionado, colum: columna });
  }

  radio_column_event(seleccionado: boolean, indice: number, columna: string): void {
    this.radio_column.emit({ index: indice, value: seleccionado, colum: columna });
  }

  combobox_event(valor: string | number): void {
    this.combobox.emit(valor);
  }

  //# column_event(index): Método que ejecuta el evento de COLUMNA.
  column_event(index, column, event) {
    if (index == this.show_clicked) this.show_clicked = -1;
    this.row_clicked(index, true);
    for (var i = 0; i < this.data_array.length; i++) {
      if (this.data_array[i] == this.resultados[index]) {
        this.column.emit({ data: this.data_array[i], column: column, target: event.target });
      }
    }
  }


  ejecucionEnviar(index: number, data: any, tipo: string) {
    let text;
    let text_data;
    let titulo_data;
    if (tipo === "play") {
      text = "En iniciar el proceso";
      text_data = "Se inició el proceso";
      titulo_data = "Iniciado !"
    } else {
      text = "En detener el proceso";
      text_data = "Se detuvo el proceso";
      titulo_data = "Detenido !"
    }

    swal.fire({
      title: 'Estas seguro?',
      text: text,
      //type: "warning",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si,ejecuta'
    }).then((result) => {
      if (result.value) {
        debugger;
        /* if (tipo === "play") {
          this.play_event(data, titulo_data, text_data);
        } else {
          this.detener_event(data, titulo_data, text_data);
        } */
      }
    })
  }

  notification_error(message: string, codigo: string) {
    swal.fire({
      title: message,
      text: codigo,
      timer: 6000,
      background: "#C79121",
      position: 'bottom-right'
    })
  };


  /* play_event(data, titulo_data: string, text_data: string) {
    //console.log("options-->", this.options_value);
    this.cronService.playCron(data.id_cron).subscribe(data => {
      if (data.response) {
        let valor: boolean = true;
        this.play_cron.emit(valor);
        swal.fire({
          title:titulo_data,
          text:text_data,
          //type:'success',
          timer: 2000
        })
      } else {
        this.notification_error(data.errorMessage, data.errorCode);
      }

    });
  } */

  /* detener_event(data, titulo_data: string, text_data: string) {
   // console.log("options-->", this.options_value);
    this.cronService.stopCron(data.id_cron).subscribe(data => {
      if (data.response) {
        let valor: boolean = true;
        this.stop_cron.emit(valor);
        swal.fire({
          title:titulo_data,
          text:text_data,
          //type:'success',
          timer: 2000
        })
      } else {
        this.notification_error(data.errorMessage, data.errorCode);
      }
    });
  } */

  //# delete_event(index): Método que ejecuta el evento de DELETE.
  delete_event(index) {
    if (index == this.show_clicked) this.show_clicked = -1;
    this.row_clicked(index, true);
    if (this.loading_edit || this.loading_delete || this.loading_view || this.loading_word || this.loading_excel || this.loading_button_custom1) {

    } else {
      for (var i = 0; i < this.data_array.length; i++) {
        if (this.data_array[i] == this.resultados[index]) {
          this.delete.emit(this.data_array[i]);
        }
      }
      this.index_clicked = index;
    }
  }

  //# word_event(index): Método que ejecuta el evento de WORD.
  word_event(index) {
    if (index == this.show_clicked) this.show_clicked = -1;
    this.row_clicked(index, true);
    if (this.loading_edit || this.loading_delete || this.loading_view || this.loading_word || this.loading_excel || this.loading_button_custom1) {
    } else {
      for (var i = 0; i < this.data_array.length; i++) {
        if (this.data_array[i] == this.resultados[index]) {
          const data = this.data_array[i];
          if ('Stimulsoft' in window) {
            this.word.emit(data);
          } else {
            this.loading_word = true;
            const sc = this.renderer2.createElement('script');
            sc.type = 'text/javascript';
            sc.src = 'assets/js/stimulsoft/stimulsoft.all.js';
            sc.onload = () => {
              this.loaded_wjs = true;
              this.word.emit(data);
            };
            this.renderer2.appendChild(this._document.body, sc);
          };
        };
      };
      this.index_clicked = index;
    };
  }

  //# word_event(index): Método que ejecuta el evento de WORD.
  excel_event(index) {
    if (index == this.show_clicked) this.show_clicked = -1;
    this.row_clicked(index, true);
    if (this.loading_edit || this.loading_delete || this.loading_view || this.loading_word || this.loading_excel || this.loading_button_custom1) {

    } else {
      for (var i = 0; i < this.data_array.length; i++) {
        if (this.data_array[i] == this.resultados[index]) {
          this.excel.emit(this.data_array[i]);
        }
      }
      this.index_clicked = index;
    }
  }

  //# view_event(index): Método que ejecuta el evento de VIEW.
  view_event(index) {
    if (index == this.show_clicked) this.show_clicked = -1;
    this.row_clicked(index, true);
    if (this.loading_edit || this.loading_delete || this.loading_view || this.loading_word || this.loading_excel || this.loading_button_custom1) {

    } else {
      for (var i = 0; i < this.data_array.length; i++) {
        if (this.data_array[i] == this.resultados[index]) {
          this.view.emit(this.data_array[i]);
        }
      }
      this.index_clicked = index;
    }
  }

  //# edit_event(index): Método que ejecuta el evento de EDIT.
  edit_event(index) {

    if (index == this.show_clicked) this.show_clicked = -1;
    this.row_clicked(index, true);
    if (this.loading_edit || this.loading_delete || this.loading_view || this.loading_word || this.loading_excel || this.loading_button_custom1) {

    } else {
      for (var i = 0; i < this.data_array.length; i++) {
        if (this.data_array[i] == this.resultados[index]) {
          this.edit.emit(this.data_array[i]);
        }
      }
      this.index_clicked = index;

    }
  }

  //# button_custom1(index): Método que ejecuta el evento para el botón personalizado 1 (button_custom1).
  button_custom1_event(index, sololectura: boolean) {
    if (sololectura || this.loading_edit || this.loading_delete || this.loading_view || this.loading_word || this.loading_excel || this.loading_button_custom1) {
    } else {
      for (var i = 0; i < this.data_array.length; i++) {
        if (this.data_array[i] == this.resultados[index]) {
          this.button_custom1.emit(this.data_array[i]);
        }
      }
      this.index_clicked = index;
    }
  }

  //# to_excel Método que exporta los datos del Array a un archivo de excel.
  to_excel() {
    this.excelService.exportAsExcelFile(this.arrayObjetosConPropiedadesNuevas(), this.options_value.title);
  }

  //# arrayObjetosConPropiedadesNuevas: Método que devuelve un Array de Objeto con las Propiedades del this.options_value.columns_headers;
  private arrayObjetosConPropiedadesNuevas(): any[] {
    let encabezadosNuevos = this.options_value.columns_headers;
    let encabezadosAntiguos = this.options_value.columns;
    return this.data_array.map(e => {
      let objAux = {};
      for (let i = 0; i < encabezadosNuevos.length; i++) {
        objAux[encabezadosNuevos[i]] = e[encabezadosAntiguos[i]];
      }
      return objAux;
    });
  }

  to_pdf() {
    let self = this;
    this.dynamicScriptLoader.loadScripts([{ name: 'pdfmake.js', src: 'assets/js/pdfmake.min.js', element: 'script' }
      , { name: 'vfs_fonts.js', src: 'assets/js/vfs_fonts.js', element: 'script' }], () => setTimeout(() => self.to_pdf_after(), 50))
  }

  to_pdf_after() {
    // var logo = get_logo();
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    var pdf = pdfMake;
    var table_array = [];
    var table_element = [];
    var columns_size = [];
    for (var i = 0; i < this.options_value.columns.length; i++) {
      table_element.push({ text: this.options_value.columns_headers[i], style: 'header' });
      columns_size.push('auto');
    }
    table_array.push(table_element);
    for (var j = 0; j < this.resultados.length; j++) {
      table_element = [];
      for (var i = 0; i < this.options_value.columns.length; i++) {
        if (this.resultados[j][this.options_value.columns[i]]) {
          table_element.push({ text: this.resultados[j][this.options_value.columns[i]], style: 'text' });
        } else {
          table_element.push({ text: "", style: 'text' });
        }
      }
      table_array.push(table_element);
    };

    pdf.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    }

    var docDefinition = {
      info: {
        title: this.options_value.title,
        author: 'Módulo de Gestión de Riesgo',
        subject: 'Módulo de Gestión de Riesgo',
        keywords: 'Módulo de Gestión de Riesgo',
        creator: 'Módulo de Gestión de Riesgo',
        producer: 'Módulo de Gestión de Riesgo'
      },
      pageSize: 'LETTER',
      pageOrientation: 'landscape',
      content: [
        // { image: logo, width: 200, margin: [0, 10, 0, 10], alignment: 'left' },
        { text: this.options_value.title, style: 'title', color: '#0000ff', margin: [0, 0, 0, 10] },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                headerRows: 1,
                body: table_array
              },
              layout: {
                fillColor: function (i, node) { return (i === 0) ? '#E9E9E9' : null; }
              }
            },
            { width: '*', text: '' },
          ]
        }
      ],
      styles: {
        title: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
        },
        header: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
        },
        text: {
          fontSize: 10,
          alignment: 'left'
        }
      }
    }
    pdfMake.createPdf(docDefinition).download(this.options_value.title + ".pdf");
  }




  //# filter_search(): Método que filtra la tabla en base al STRING ingresado en el campo de búsqueda
  filter_search() {
    this.pagination_navigation(this.nav_min_value());
    var temp_results = [];
    if (this.search_word && this.search_word != null && this.search_word != "") {
      for (var i = 0; i < this.data_array.length; i++) {
        for (var j = 0; j < this.options_value.columns.length; j++) {
          if (this.data_array[i][this.options_value.columns[j]] && this.data_array[i][this.options_value.columns[j]].toString().toLowerCase().includes(this.search_word.toLowerCase().trim())) {
            temp_results.push(this.data_array[i]);
            break;
          }
        }
      }
      this.filtering = true;
      this.resultados = temp_results;
      this.update_offsets();
      this.pag_reference = [];
      for (var i = 0; i < this.resultados.length / this.offsetView; i++) {
        this.pag_reference.push(' ');
      }
    } else {
      this.filtering = false;
      this.resultados = this.data_array;
      this.update_offsets();
      this.pag_reference = [];
      for (var i = 0; i < this.resultados.length / this.offsetView; i++) {
        this.pag_reference.push(' ');
      }
    }
  }

  //# update_offsets(): Método que actualiza los offset de referencia de paginación y el arreglo de referencia de paginación
  update_offsets() {
    this.requestOffsetRight = 0;
    this.requestOffsetLeft = 0;
    this.show_clicked = -1;
    if (this.resultados.length > 0) {
      if (this.resultados.length < this.offsetView) {
        this.requestOffsetRight = this.resultados.length;
      } else {
        this.requestOffsetRight = this.offsetView;
      }
      this.requestOffsetLeft = 1;
      this.displaying = [];
      for (var i = this.requestOffsetLeft - 1; i < this.requestOffsetRight; i++) {
        this.displaying.push(" ");
      }
    } else {
      this.displaying = [];
      this.requestOffsetRight = 0;
      this.requestOffsetLeft = 0;
    };
    setTimeout(() => {
      this.pagination_navigation(this.set_page_selected);
    }, 10);
    this.get_page_size.emit(this.offsetView);
  }

  //# updateRequestsGoRight(): Método que actualiza los offset de referencia de paginación y el arreglo de referencia de paginación cuando el usuario da clic en la flecha derecha
  updateRequestsGoRight() {
    if (this.resultados.length > 0) {
      if (this.resultados.length < this.requestOffsetRight + this.offsetView) {
        this.requestOffsetRight = this.resultados.length;
      } else {
        this.requestOffsetRight = this.requestOffsetRight + this.offsetView;

      }
      this.requestOffsetLeft = this.requestOffsetLeft + this.offsetView;
      this.displaying = [];
      for (var i = this.requestOffsetLeft - 1; i < this.requestOffsetRight; i++) {
        this.displaying.push(" ");
      }
    } else {
      this.displaying = [];
    }
  }

  //# updateRequestsGoLeft(): Método que actualiza los offset de referencia de paginación y el arreglo de referencia de paginación cuando el usuario da clic en la flecha izquierda
  updateRequestsGoLeft() {
    if (this.resultados.length > 0) {
      if (this.resultados.length == this.requestOffsetRight) {
        this.requestOffsetLeft = this.requestOffsetLeft - this.offsetView;
        this.requestOffsetRight = this.requestOffsetLeft + this.offsetView - 1;
      } else {
        this.requestOffsetLeft = this.requestOffsetLeft - this.offsetView;
        this.requestOffsetRight = this.requestOffsetRight - this.offsetView;
      }
      this.displaying = [];
      for (var i = this.requestOffsetLeft - 1; i < this.requestOffsetRight; i++) {
        this.displaying.push(" ");
      }
    } else {
      this.displaying = [];
    }
  }

  //# sort_column(index): Método que recibe el indice de la columna que se está filtrando. El mismo verifica si es ascendente, descendente, y el tipo de dato de la columna a filtrar (con el propósito de aplicar el filtro correspondiente)
  sort_column(index) {
    if (!this.options_value.hide_sort) {
      if (this.order == this.options_value.columns[index] && this.ascendent == false) {
        this.ascendent = true;
        if (this.options_value.columns_types[index] == "number") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (x < y) { return 1; }
            if (x > y) { return -1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "text") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]].toLowerCase().replace("\"", "").replace(".", "").replace("  ", " ").trim();
            var y = b[this.options_value.columns[index]].toLowerCase().replace("\"", "").replace(".", "").replace("  ", " ").trim();
            if (x < y) { return 1; }
            if (x > y) { return -1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "date") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (y.length >= 16) {
              var y_date = new Date(parseInt(y.substring(6, 10)), parseInt(y.substring(0, 2)) - 1, parseInt(y.substring(3, 5)), parseInt(y.substring(11, 13)), parseInt(y.substring(14, 16)));
            } else {
              var y_date = new Date(3000, 11, 31);
            }
            if (x.length >= 16) {
              var x_date = new Date(parseInt(x.substring(6, 10)), parseInt(x.substring(0, 2)) - 1, parseInt(x.substring(3, 5)), parseInt(x.substring(11, 13)), parseInt(x.substring(14, 16)));
            } else {
              var x_date = new Date(3000, 11, 31);
            }
            if (x_date.getTime() < y_date.getTime()) { return 1; }
            if (x_date.getTime() > y_date.getTime()) { return -1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "date-DD/MM/YYYY") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (y.length >= 10) {
              var y_date = new Date(parseInt(y.substring(6, 10)), parseInt(y.substring(3, 5)) - 1, parseInt(y.substring(0, 2)));
            } else {
              var y_date = new Date(3000, 11, 31);
            }
            if (x.length >= 10) {
              var x_date = new Date(parseInt(x.substring(6, 10)), parseInt(x.substring(3, 5)) - 1, parseInt(x.substring(0, 2)));
            } else {
              var x_date = new Date(3000, 11, 31);
            }
            if (x_date.getTime() < y_date.getTime()) { return 1; }
            if (x_date.getTime() > y_date.getTime()) { return -1; }
            return 0;
          });
        }
      } else if (this.order == this.options_value.columns[index] && this.ascendent == true) {
        this.ascendent = false;
        if (this.options_value.columns_types[index] == "number") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "text") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]].toLowerCase().replace("\"", "").replace(".", "").replace("  ", " ").trim();
            var y = b[this.options_value.columns[index]].toLowerCase().replace("\"", "").replace(".", "").replace("  ", " ").trim();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "date") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (y.length >= 16) {
              var y_date = new Date(parseInt(y.substring(6, 10)), parseInt(y.substring(0, 2)) - 1, parseInt(y.substring(3, 5)), parseInt(y.substring(11, 13)), parseInt(y.substring(14, 16)));
            } else {
              var y_date = new Date(3000, 11, 31);
            }
            if (x.length >= 16) {
              var x_date = new Date(parseInt(x.substring(6, 10)), parseInt(x.substring(0, 2)) - 1, parseInt(x.substring(3, 5)), parseInt(x.substring(11, 13)), parseInt(x.substring(14, 16)));
            } else {
              var x_date = new Date(3000, 11, 31);
            }
            if (x_date.getTime() < y_date.getTime()) { return -1; }
            if (x_date.getTime() > y_date.getTime()) { return 1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "date-DD/MM/YYYY") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (y.length >= 10) {
              var y_date = new Date(parseInt(y.substring(6, 10)), parseInt(y.substring(3, 5)) - 1, parseInt(y.substring(0, 2)));
            } else {
              var y_date = new Date(3000, 11, 31);
            }
            if (x.length >= 10) {
              var x_date = new Date(parseInt(x.substring(6, 10)), parseInt(x.substring(3, 5)) - 1, parseInt(x.substring(0, 2)));
            } else {
              var x_date = new Date(3000, 11, 31);
            }
            if (x_date.getTime() < y_date.getTime()) { return -1; }
            if (x_date.getTime() > y_date.getTime()) { return 1; }
            return 0;
          });
        }
      } else {
        this.order = this.options_value.columns[index];
        this.ascendent = false;
        if (this.options_value.columns_types[index] == "number") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "text") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]].toLowerCase().replace("\"", "").replace(".", "").replace("  ", " ").trim();
            var y = b[this.options_value.columns[index]].toLowerCase().replace("\"", "").replace(".", "").replace("  ", " ").trim();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "date") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (y.length >= 16) {
              var y_date = new Date(parseInt(y.substring(6, 10)), parseInt(y.substring(0, 2)) - 1, parseInt(y.substring(3, 5)), parseInt(y.substring(11, 13)), parseInt(y.substring(14, 16)));
            } else {
              var y_date = new Date(3000, 11, 31);
            }
            if (x.length >= 16) {
              var x_date = new Date(parseInt(x.substring(6, 10)), parseInt(x.substring(0, 2)) - 1, parseInt(x.substring(3, 5)), parseInt(x.substring(11, 13)), parseInt(x.substring(14, 16)));
            } else {
              var x_date = new Date(3000, 11, 31);
            }
            if (x_date.getTime() < y_date.getTime()) { return -1; }
            if (x_date.getTime() > y_date.getTime()) { return 1; }
            return 0;
          });
        } else if (this.options_value.columns_types[index] == "date-DD/MM/YYYY") {
          this.resultados.sort((a, b) => {
            var x = a[this.options_value.columns[index]];
            var y = b[this.options_value.columns[index]];
            if (y.length >= 10) {
              var y_date = new Date(parseInt(y.substring(6, 10)), parseInt(y.substring(3, 5)) - 1, parseInt(y.substring(0, 2)));
            } else {
              var y_date = new Date(3000, 11, 31);
            }
            if (x.length >= 10) {
              var x_date = new Date(parseInt(x.substring(6, 10)), parseInt(x.substring(3, 5)) - 1, parseInt(x.substring(0, 2)));
            } else {
              var x_date = new Date(3000, 11, 31);
            }
            if (x_date.getTime() < y_date.getTime()) { return -1; }
            if (x_date.getTime() > y_date.getTime()) { return 1; }
            return 0;
          });
        }
      }
    }
  }

  //# pagination_navigation(value): Método que cambia de paginación cuando el usuario da clic en un botón de paginación
  pagination_navigation(value) {
    this.requestOffsetLeft = (this.offsetView * (value - 1)) + 1;
    if (this.offsetView * value > this.resultados.length) {
      this.requestOffsetRight = this.resultados.length;
    } else {
      this.requestOffsetRight = this.offsetView * value;
    }
    this.displaying = [];
    for (var i = this.requestOffsetLeft - 1; i < this.requestOffsetRight; i++) {
      this.displaying.push(" ");
    }
    this.get_page_selected.emit(+value);
  }
  pagination_navigation_external(value: number): void {
    if (value > 0 && value <= this.page_end) {
      this.page_external_select.emit(value);
    };
  }

  //# nav_current_value(): Método que retorna el valor actual de paginación
  nav_current_value() {

    return Math.ceil(this.requestOffsetRight / this.offsetView);
  }

  //# nav_show(index): Método que retorna la validez de un índice de paginación. En caso de ser inválido, el template no lo muestra
  nav_show(index) {
    if (this.nav_max_value() >= index && (((this.nav_current_value() - 3) <= index && index <= (this.nav_current_value() + 3))) ||
      (this.nav_current_value() <= this.nav_min_value() + 2 && index <= this.nav_min_value() + 6) ||
      (this.nav_current_value() >= this.nav_max_value() - 2 && index >= this.nav_max_value() - 6)) {
      return true;
    } else {
      return false;
    }
  }

  //# nav_min_value(): Retorna el valor mínimo posible de paginación
  nav_min_value() {

    return 1;
  }

  //# nav_max_value(): Retorna el valor máximo posible de paginación
  nav_max_value() {

    return Math.ceil(this.resultados.length / this.offsetView);
  }

  //# limpiar_filtro(): Método que limpiar la caja de Filtro y ejecuta nuevamente el filtro
  limpiar_filtro() {
    this.search_word = '';
    this.filter_search();
  }

  row_clicked(index, do_click) {
    this.child_index_show = -1;
    if (do_click) {
      if (this.show_clicked != index) {
        this.show_clicked = index;
      } else {
        this.show_clicked = -1;
      }
    }
    if (this.options_value.columns_child_active) {
      this.child_index_show = index;
      // this.row_event.emit(index);
    };
    /*if(do_click){
      if(this.resultados[index].row_clicked){
        this.resultados[index].row_clicked = false;
      }else{
        this.resultados[index].row_clicked = true;
      }
    }*/
  }

  //# FINAL  # LOGICA #
  //###################
}

//# FINAL  # MODULO DE DATATABLES #
//#################################