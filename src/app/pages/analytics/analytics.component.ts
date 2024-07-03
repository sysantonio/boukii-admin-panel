import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import Plotly from 'plotly.js-dist-min';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {MonitorsCreateUpdateComponent} from '../monitors/monitors-create-update/monitors-create-update.component';
import {TableColumn} from '../../../@vex/interfaces/table-column.interface';
import {Router} from '@angular/router';
import {ApiCrudService} from '../../../service/crud.service';
import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import moment from 'moment/moment';
import {MOCK_COUNTRIES} from '../../static-data/countries-data';
import {MOCK_PROVINCES} from '../../static-data/province-data';

@Component({
  selector: 'vex-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  courseTypeHoursData = [
    {name: this.translateService.instant('course_colective'), value: 0, max_value:0, color: '#ff5733'},
    {name:  this.translateService.instant('course_private'), value: 0, max_value:0, color: '#33c7ff'},
    {name: this.translateService.instant('activity'), value: 0, max_value:0, color: '#ff33b8'}
  ];
  allSports: any[] = []; // Array para almacenar todos los deportes

  countries = MOCK_COUNTRIES;
  provinces = MOCK_PROVINCES;
  filter = '';
  monitor= null;
  imageAvatar = '../../../assets/img/avatar.png';
  user: any;
  icon = '../../../assets/img/icons/monitores.svg';
  totalHours = this.courseTypeHoursData.reduce((acc, course) => acc + course.value, 0);
  createComponent = MonitorsCreateUpdateComponent;
  showDetail: boolean = false;
  entity = '/admin/statistics/bookings/monitors';
  entitySales = '/admin/statistics/bookings/sells';
  selectedId = null;
  deleteEntity = '/monitors';
  totalSportHours: number = 0;
  totalPriceSell = 0;
  currency = '';
  sportHoursData: any[] = [];
  selectedFrom = null;
  selectedSport = null;
  selectedTo = null;

  columns: TableColumn<any>[] = [
    {label: 'monitor', property: 'monitor', type: 'monitor', visible: true, cssClasses: ['font-medium']},
    {label: 'sport', property: 'sport', type: 'sport', visible: true, cssClasses: ['font-medium']},
    {label: 'hours_collective', property: 'hours_collective', type: 'text', visible: true},
    {label: 'hours_private', property: 'hours_private', type: 'text', visible: true, cssClasses: ['font-medium']},
    {label: 'hours_activities', property: 'hours_activities', type: 'text', visible: true, cssClasses: ['font-medium']},
    {label: 'hours_nwd_payed', property: 'hours_nwd_payed', type: 'text', visible: true, cssClasses: ['font-medium']},
    {label: 'base_price', property: 'hour_price', type: 'price', visible: true},
    {label: 'total_hours', property: 'total_hours', type: 'text', visible: true},
    {label: 'total', property: 'total_cost', type: 'price', visible: true},
  ];

  columnsSales: TableColumn<any>[] = [
    {label: 'name', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium']},
    {label: 'availability', property: 'available_places', type: 'text', visible: true, cssClasses: ['font-medium']},
    {label: 'sold', property: 'booked_places', type: 'text', visible: true},
    {label: 'cash', property: 'payments.cash', type: 'price', visible: true, cssClasses: ['font-medium']},
    {label: 'other', property: 'payments.other', type: 'price', visible: true, cssClasses: ['font-medium']},
    {label: 'T.Boukii', property: 'payments.boukii', type: 'price', visible: true, cssClasses: ['font-medium']},
    {label: 'online', property: 'payments.online', type: 'price', visible: true, cssClasses: ['font-medium']},
    {label: 'voucher', property: 'payments.voucher', type: 'price', visible: true, cssClasses: ['font-medium']},
    {label: 'total', property: 'total_cost', type: 'price', visible: true},
  ];

  columnsDetail: TableColumn<any>[] = [
    {label: 'date', property: 'date', type: 'date', visible: true, cssClasses: ['font-medium']},
    {label: 'sport', property: 'sport', type: 'sport', visible: true, cssClasses: ['font-medium']},
    {label: 'hours_collective', property: 'hours_collective', type: 'text', visible: true},
    {label: 'hours_private', property: 'hours_private', type: 'text', visible: true, cssClasses: ['font-medium']},
    {label: 'hours_activities', property: 'hours_activities', type: 'text', visible: true, cssClasses: ['font-medium']},
    {label: 'hours_nwd_payed', property: 'hours_nwd_payed', type: 'text', visible: true, cssClasses: ['font-medium']},
    {label: 'base_price', property: 'hour_price', type: 'price', visible: true},
    {label: 'total_hours', property: 'total_hours', type: 'text', visible: true},
    {label: 'total', property: 'total_cost', type: 'price', visible: true},

  ];

  constructor(private crudService: ApiCrudService, private router: Router, public translateService: TranslateService,
              private cdr: ChangeDetectorRef) {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
  }

  ngOnInit(): void {

  }

  updateTotalHours() {
    this.totalHours = this.courseTypeHoursData.reduce((acc, course) => acc + course.max_value, 0);
  }

  updateCourseValue(index: number, newValue: number, newMaxValue: number = 0) {
    this.courseTypeHoursData[index].value = newValue;
    this.courseTypeHoursData[index].max_value = newMaxValue;
    this.updateTotalHours();

    // Crear una nueva referencia al array
    this.courseTypeHoursData = [...this.courseTypeHoursData];
    this.cdr.detectChanges();
  }

  getBookingsTotal(type): Observable<any> {
    return this.crudService.list('/admin/statistics/bookings', 1, 10000,
      'desc', 'id', '&school_id=' + this.user.schools[0].id + '&type=' + type+this.filter);
  }

  getBookingsByDate(): Observable<any> {
    return this.crudService.list('/admin/statistics/bookings/dates', 1, 10000,
      'desc', 'id', '&school_id=' + this.user.schools[0].id+this.filter);
  }

  getBookingsByDateSport(): Observable<any> {
    return this.crudService.list('/admin/statistics/bookings/sports', 1, 10000,
      'desc', 'id', '&school_id=' + this.user.schools[0].id+this.filter);
  }

  getActiveMonitors(): Observable<any> {
    return this.crudService.list('/admin/statistics/bookings/monitors/active', 1, 10000,
      'desc', 'id', '&school_id=' + this.user.schools[0].id+this.filter);
  }

  getTotalHours(): Observable<any> {
    return this.crudService.list('/admin/statistics/bookings/monitors/hours', 1, 10000,
      'desc', 'id', '&school_id=' + this.user.schools[0].id+this.filter);
  }

  getTotalHoursBySport(): Observable<any> {
    return this.crudService.list('/admin/statistics/bookings/monitors/sports', 1, 10000,
      'desc', 'id', '&school_id=' + this.user.schools[0].id+this.filter);
  }

  showDetailEvent(event: any) {
    this.showDetail = true;
    this.selectedId = event.item.id;
    this.getMonitor().subscribe(res => {
      this.monitor = res.data;
      this.filter += '&monitor_id='+this.selectedId;
      let settings = JSON.parse(this.user.schools[0].settings);
      this.courseTypeHoursData = [
        {name: this.translateService.instant('course_colective'), value: 0, max_value:0, color: '#ff5733'},
        {name:  this.translateService.instant('course_private'), value: 0, max_value:0, color: '#33c7ff'},
        {name: this.translateService.instant('activity'), value: 0, max_value:0, color: '#ff33b8'}
      ];
      this.reloadData(true);
    })

  }

  calculateAge(birthDateString) {
    if(birthDateString && birthDateString !== null) {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    } else {
      return 0;
    }

  }

  getMonitor() {
    return this.crudService.get('/monitors/' + this.selectedId, ['language1']);
  }

  closeDetailEvent(event: any) {
    this.showDetail = false;
    this.selectedId = null;
    this.reloadData(true);
  }

  ngAfterViewInit(): void {
    this.getTotalHoursBySport().subscribe(res => {
      this.allSports = Object.keys(res.data).map(sportId => {
        const sportData = res.data[sportId];
        //  this.totalSportHours += sportData.hours;
        return {
          id: sportData.sport.id,
          name: sportData.sport.name,
          value: sportData.hours,
          icon: sportData.sport.icon_selected,
          color: 'blue'  // Puedes ajustar para usar colores específicos
        };
      });
    });
    let voucherText = {
      'title': this.translateService.instant('vouchers'),
      'subtitle': this.translateService.instant('sales'),
      'price': '3560.00 CHF',
      'subprice': this.translateService.instant('occupation'),
    }
    this.setPlotly('magenta', voucherText, 'voucher', 350, 500);
    this.getBookingsByDate().subscribe(res => {
      this.setUserSessionAnalytics(false, res.data);
    })

    this.getBookingsByDateSport().subscribe(res => {
      this.updateChartBySport(false, res.data);
    })

    let settings = JSON.parse(this.user.schools[0].settings);
    this.currency = settings?.taxes?.currency;
    this.reloadData(false);
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  filterData() {

    this.reloadData(true);
  }

  reloadData(monitors) {
    let filter = '';

    if (this.selectedFrom) {
      filter = filter + '&start_date='+moment(this.selectedFrom).format('YYYY-MM-DD');
    }
    if (this.selectedTo) {
      filter = filter + '&end_date='+moment(this.selectedTo).format('YYYY-MM-DD');
    }
    if (this.selectedSport) {
      filter = filter + '&sport_id='+this.selectedSport;
    }

    if (this.selectedId) {
      filter = filter + '&monitor_id='+this.selectedId;
    }

    this.filter = filter;
    this.totalPriceSell = 0;
    this.courseTypeHoursData = [
      {name: this.translateService.instant('course_colective'), value: 0, max_value:0, color: '#ff5733'},
      {name:  this.translateService.instant('course_private'), value: 0, max_value:0, color: '#33c7ff'},
      {name: this.translateService.instant('activity'), value: 0, max_value:0, color: '#ff33b8'}
    ];
    this.getBookingsTotal(1).subscribe(res => {
      const collectiveText = {
        'title': this.translateService.instant('course_colective'),
        'subtitle': this.translateService.instant('sales'),
        'price': `${res.data.total_price}${this.currency}`,
        'subprice': this.translateService.instant('occupation'),
      };
      this.updateCourseValue(0, res.data.total_hours - res.data.total_available_hours,
        res.data.total_hours);
      if(!monitors) {
        this.setPlotly('orange', collectiveText, 'collective',
          res.data.total_places - res.data.total_available_places, res.data.total_available_places);
      }

      this.totalPriceSell += res.data.total_price;

    });

    this.getBookingsTotal(2).subscribe(res => {
      const collectiveText = {
        'title': this.translateService.instant('course_private'),
        'subtitle': this.translateService.instant('sales'),
        'price': `${res.data.total_price}${this.currency}`,
        'subprice': this.translateService.instant('occupation'),
      };
      this.updateCourseValue(1, res.data.total_hours - res.data.total_available_hours,
        res.data.total_hours);
      if(!monitors) {
        this.setPlotly('green', collectiveText, 'prive',
          res.data.total_places - res.data.total_available_places, res.data.total_places);

      }
      this.totalPriceSell += res.data.total_price;

    });

    this.getBookingsTotal(3).subscribe(res => {
      const collectiveText = {
        'title': this.translateService.instant('activity'),
        'subtitle': this.translateService.instant('sales'),
        'price': `${res.data.total_price}${this.currency}`,
        'subprice': this.translateService.instant('occupation'),
      };
      this.updateCourseValue(2, res.data.total_hours - res.data.total_available_hours,
        res.data.total_hours);
      if(!monitors) {
        this.setPlotly('blue', collectiveText, 'activity',
          res.data.total_places - res.data.total_available_places, res.data.total_places);
      }
      this.totalPriceSell += res.data.total_price;

    });


    this.getTotalHoursBySport().subscribe(res => {
      this.processSportData(res.data);
    });
    let plotActiveMonitors = 'activeMonitors';
    let plotTotalHours = 'totalHours';
    if(monitors) {
      plotActiveMonitors = 'activeMonitorsFiltered';
      plotTotalHours = 'totalHoursFiltered';
    }

    if(!this.showDetail) {
      this.getActiveMonitors().subscribe(res => {
        let collectiveText = {
          'title': this.translateService.instant('monitors'),
          'subtitle': this.translateService.instant('sales'),
          'price': res.data.busy + '/' + res.data.total,
          'subprice': this.translateService.instant('occupation'),
        }
        this.setPlotly('blue', collectiveText, plotActiveMonitors, res.data.busy, res.data.total)
      });
    }
    this.getTotalHours().subscribe(res => {
      let collectiveText = {
        'title': this.translateService.instant('hours_worked'),
        'subtitle': this.translateService.instant('hours_worked_total'),
        'price': res.data.totalWorkedHours + 'h',
        'subprice': this.translateService.instant('hours_worked') + '/' + this.translateService.instant('blocks'),
      }
      this.setPlotly('blue', collectiveText, plotTotalHours, res.data.totalNwdHours + res.data.totalBookingHours, res.data.totalMonitorHours)
    });

    this.cdr.detectChanges();
  }

  loadSellData() {
    this.getBookingsTotal(1).subscribe(res => {
      const collectiveText = {
        'title': this.translateService.instant('course_colective'),
        'subtitle': this.translateService.instant('sales'),
        'price': `${res.data.total_price}${this.currency}`,
        'subprice': this.translateService.instant('occupation'),
      };

      this.setPlotly('orange', collectiveText, 'collectiveSales',
        res.data.total_places - res.data.total_available_places, res.data.total_available_places);


      this.totalPriceSell += res.data.total_price;

    });

    this.getBookingsTotal(2).subscribe(res => {
      const collectiveText = {
        'title': this.translateService.instant('course_private'),
        'subtitle': this.translateService.instant('sales'),
        'price': `${res.data.total_price}${this.currency}`,
        'subprice': this.translateService.instant('occupation'),
      };

      this.setPlotly('green', collectiveText, 'priveSales',
        res.data.total_places - res.data.total_available_places, res.data.total_places);


      this.totalPriceSell += res.data.total_price;

    });

    this.getBookingsTotal(3).subscribe(res => {
      const collectiveText = {
        'title': this.translateService.instant('activity'),
        'subtitle': this.translateService.instant('sales'),
        'price': `${res.data.total_price}${this.currency}`,
        'subprice': this.translateService.instant('occupation'),
      };

      this.setPlotly('blue', collectiveText, 'activitySales',
        res.data.total_places - res.data.total_available_places, res.data.total_places);

      this.totalPriceSell += res.data.total_price;

    });

    let voucherText = {
      'title': this.translateService.instant('vouchers'),
      'subtitle': this.translateService.instant('sales'),
      'price': '3560.00 CHF',
      'subprice': this.translateService.instant('occupation'),
    }
    this.setPlotly('magenta', voucherText, 'voucherSales', 350, 500);
  }


  onTabChange(event: MatTabChangeEvent) {
    if (event.index === 2) {
      this.reloadData(true);
      this.getBookingsByDate().subscribe(res => {
        this.setUserSessionAnalytics(true, res.data);
      })


    } else if(event.index === 0) {
      this.filter = '';
      this.reloadData(false);
      this.getBookingsByDate().subscribe(res => {
        this.setUserSessionAnalytics(false, res.data);
      })
    } else if(event.index === 1) {
      this.filter = '';
      this.loadSellData();
    }
  }

  setPlotly(color, text, id, value, maxValue) {

    // Calcular el porcentaje
    let percent:any = (value /  maxValue) * 100;

    if (isNaN(percent)) {
      percent = 0;
    }

    const data = [
      {
        domain: {x: [0, 1], y: [0, 1]},
        value: percent,  // Valor del medidor
        title: {text: "Medidor Semi Circular"},
        type: "indicator",
        mode: "gauge",
        gauge: {
          shape: "angular",
          bar: {
            color: color,
            thickness: 1  // Ajusta el grosor de la barra
          },
          axis: {
            range: [null, 100],  // Rango del eje
            showticklabels: false,  // Oculta las etiquetas de las marcas
            ticks: "",  // Oculta los ticks
            showline: true,  // Muestra la línea del eje
            linecolor: "black",  // Color de la línea del eje
            linewidth: 1  // Grosor de la línea del eje
          },
          steps: [
            {
              range: [0, percent],
              color: color
            },
            {
              range: [percent, 100],
              color: "lightgrey"
            }
          ],
          bgcolor: "rgba(0,0,0,0)",  // Fondo transparente
          borderwidth: 0,  // Grosor del borde
          bordercolor: "black"  // Color del borde
        }
      }
    ];

    const layout = {
      height: 250,
      margin: {t: 45, b: 10, l: 40, r: 40},  // Aumentamos el margen superior (t) para dar espacio al texto
      paper_bgcolor: "rgba(0,0,0,0)",  // Fondo del gráfico transparente
      plot_bgcolor: "rgba(0,0,0,0)",   // Fondo del área del gráfico transparente
      annotations: [{
        text: percent.toFixed(2) + "%",  // Mostrar el porcentaje con dos decimales
        font: {
          family: "Dinamit, sans-serif",
          weight: "bold",
          size: 36,
          color: color
        },
        showarrow: false,
        x: 0.5,
        y: 0.3,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'center',
        yanchor: 'middle',
        align: 'center',
        pad: {t: 10, r: 10, b: 10, l: 10}  // Espacio alrededor del texto
      },
        {
          text: text.title,
          font: {
            family: "Dinamit, sans-serif",
            weight: "bold",
            size: 20,
            color: color
          },
          showarrow: false,
          x: 0,
          y: 1.1,  // Ajustamos el valor de y para que el texto esté más arriba
          xref: 'paper',
          yref: 'paper',
          xanchor: 'left',
          yanchor: 'bottom',
          align: 'left',
          pad: {t: 10, r: 10, b: 10, l: 10}  // Espacio alrededor del texto
        },
        {
          text: text.subtitle,
          font: {
            family: "Dinamit, sans-serif",
            weight: 'normal',
            size: 14,
            color: 'lightgray'
          },
          showarrow: false,
          x: 0,
          y: 1,
          xref: 'paper',
          yref: 'paper',
          xanchor: 'left',
          yanchor: 'bottom',
          align: 'left',
          pad: {t: 10, r: 10, b: 10, l: 10}  // Espacio alrededor del texto
        },
        {
          text: text.price,
          font: {
            family: "Dinamit, sans-serif",
            weight: 'bold',
            size: 22,
            color: 'black'
          },
          showarrow: false,
          x: 0,
          y: 0.87,  // Ajustamos el valor de y para que el texto esté más arriba
          xref: 'paper',
          yref: 'paper',
          xanchor: 'left',
          yanchor: 'bottom',
          align: 'left',
          pad: {t: 10, r: 10, b: 10, l: 10}  // Espacio alrededor del texto
        },
        {
          text: text.subprice,
          font: {
            family: "Dinamit, sans-serif",
            size: 14,
            weight: 'normal',
            color: 'lightgray'
          },
          showarrow: false,
          x: 0,
          y: 0.8,
          xref: 'paper',
          yref: 'paper',
          xanchor: 'left',
          yanchor: 'bottom',
          align: 'left',
          pad: {t: 10, r: 10, b: 10, l: 10}  // Espacio alrededor del texto
        }
      ],

    };
    var config = {
      displayModeBar: false,  // Oculta el modo de visualización que incluye el botón de descarga
      displaylogo: false,
      responsive: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d']// Oculta la etiqueta "Produced by Plotly"
    }

    Plotly.newPlot(id, data, layout, config);

    window.onresize = function() {
      Plotly.Plots.resize(document.getElementById(id));
    };
  }

  processSportData(data) {
    this.totalSportHours = 0;
    this.sportHoursData = Object.keys(data).map(sportId => {
      const sportData = data[sportId];
      this.totalSportHours += sportData.hours;
      return {
        id: sportData.sport.id,
        name: sportData.sport.name,
        value: sportData.hours,
        icon: sportData.sport.icon_selected,
        color: 'blue'  // Puedes ajustar para usar colores específicos
      };
    });
  }

  setUserSessionAnalytics(monitors, data) {
    const dates = Object.keys(data);
    const courseType1 = dates.map(date => data[date][1] || 0);
    const courseType2 = dates.map(date => data[date][2] || 0);
    const courseType3 = dates.map(date => data[date][3] || 0);

    const trace1 = {
      x: dates,
      y: courseType1,
      mode: 'lines+markers',
      name: this.translateService.instant('course_colective'),
      line: {color: '#ff5733'}
    };

    const trace2 = {
      x: dates,
      y: courseType2,
      mode: 'lines+markers',
      name:  this.translateService.instant('course_private'),
      line: {color: '#33c7ff'}
    };

    const trace3 = {
      x: dates,
      y: courseType3,
      mode: 'lines+markers',
      name: this.translateService.instant('activity'),
      line: {color: '#ff33b8'}
    };

    const chartData = [trace1, trace2, trace3];

    const layout = {
      title:  this.translateService.instant('hours_by_type'),
      xaxis: {
        title:  this.translateService.instant('dates'),
        type: 'date',
        tickformat: '%Y-%m', // Formato para mostrar solo el año y el mes
      },
      yaxis: {
        title:  this.translateService.instant('total'),
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: true,
    };

    if(monitors) {
      Plotly.newPlot('user-session-analytics4', chartData, layout);
    } else {
      Plotly.newPlot('user-session-analytics', chartData, layout);
    }

  }

  updateChartBySport(monitors, data) {
    const dates = Object.keys(data); // Obtener todas las fechas

    const sports = {};

    // Organizar los datos por deporte
    dates.forEach(date => {
      const dayData = data[date];
      Object.keys(dayData).forEach(sport => {
        if (!sports[sport]) {
          sports[sport] = [];
        }
        sports[sport].push(dayData[sport]);
      });

      // Si algún deporte no tiene entrada para esta fecha, agregar 0
      Object.keys(sports).forEach(sport => {
        if (!dayData[sport]) {
          sports[sport].push(0);
        }
      });
    });

    const traces = Object.keys(sports).map(sport => ({
      x: dates,
      y: sports[sport],
      mode: 'lines+markers',
      name: sport,
    }));

    const layout = {
      title: this.translateService.instant('hours_by_sport'),
      xaxis: {
        title:  this.translateService.instant('date'),
        type: 'date',
        tickformat: '%Y-%m', // Formato para mostrar solo el año y el mes
      },
      yaxis: {
        title:  this.translateService.instant('total'),
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: true,
    };

    Plotly.newPlot('user-session-analytics2', traces, layout);
  }


  getCountry(id: any) {
    const country = this.countries.find((c) => c.id == +id);
    return country ? country.name : 'NDF';
  }

  getPercentage(value: number, total) {
    return (value / total) * 100;
  }

}
