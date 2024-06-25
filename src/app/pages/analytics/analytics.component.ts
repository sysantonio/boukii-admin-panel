import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BonusesCreateUpdateComponent} from '../bonuses/bonuses-create-update/bonuses-create-update.component';
import Plotly from 'plotly.js-dist-min'
import {MatTabChangeEvent} from '@angular/material/tabs';
import Swiper from 'swiper';
import {MonitorsCreateUpdateComponent} from '../monitors/monitors-create-update/monitors-create-update.component';
import {TableColumn} from '../../../@vex/interfaces/table-column.interface';

@Component({
  selector: 'vex-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit{
  courseTypeHoursData = [
    { name: 'Cours Collectifs', value: 3560, color: '#ff5733' },
    { name: 'Cours Privés', value: 4560, color: '#33c7ff' },
    { name: 'Activites', value: 2560, color: '#ff33b8' }
  ];


  user: any;
  icon = '../../../assets/img/icons/monitores.svg';
  totalHours = this.courseTypeHoursData.reduce((acc, course) => acc + course.value, 0);
  createComponent = MonitorsCreateUpdateComponent;
  entity = '/admin/statistics/bookings/monitors';
  deleteEntity = '/monitors';

  columns: TableColumn<any>[] = [
    { label: 'monitor', property: 'monitor', type: 'monitor', visible: true, cssClasses: ['font-medium'] },
    { label: 'sport', property: 'sport', type: 'sport', visible: true, cssClasses: ['font-medium'] },
    { label: 'hours_collective', property: 'hours_collective', type: 'text', visible: true },
    { label: 'hours_private', property: 'hours_private', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'hours_activities', property: 'hours_activities', type: 'text', visible: true, cssClasses: ['font-medium'] },
    { label: 'cost_collective', property: 'cost_collective', type: 'price', visible: true },
    { label: 'cost_private', property: 'cost_private', type: 'price', visible: true },
    { label: 'cost_activities', property: 'cost_activities', type: 'price', visible: true },
    { label: 'total_hours', property: 'total_hours', type: 'text', visible: true },
    { label: 'total_cost', property: 'total_cost', type: 'price', visible: true },
  ];
  constructor() {
    this.user = JSON.parse(localStorage.getItem('boukiiUser'));
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    let collectiveText = {
      'title': 'Cours Collectifs',
      'subtitle': 'Ventes total',
      'price': '3560.00 CHF',
      'subprice': 'Taux d\'occupation',
    }
    let priveText = {
      'title': 'Cours Prive',
      'subtitle': 'Ventes total',
      'price': '3560.00 CHF',
      'subprice': 'Taux d\'occupation',
    }
    let activityText = {
      'title': 'Activities',
      'subtitle': 'Ventes total',
      'price': '3560.00 CHF',
      'subprice': 'Taux d\'occupation',
    }
    let voucherText = {
      'title': 'Bonos',
      'subtitle': 'Ventes total',
      'price': '3560.00 CHF',
      'subprice': 'Taux d\'occupation',
    }
   this.setPlotly('orange', collectiveText, 'collective', 358, 500);
   this.setPlotly('orange', collectiveText, 'collective2', 262, 500);

   this.setPlotly('green',priveText, 'prive', 350, 500);
   this.setPlotly('green',priveText, 'prive2', 350, 500);

   this.setPlotly('blue', activityText, 'activity', 350, 500);
   this.setPlotly('blue', activityText, 'activity2', 350, 500);

   this.setPlotly('magenta', voucherText, 'voucher', 350, 500);
    this.setUserSessionAnalytics(false);
    this.setCourseTypeHours();
  }

  onTabChange(event: MatTabChangeEvent) {
    // Si el índice de la pestaña es 1 (No Disponibles)
    let collectiveText = {
      'title': 'Cours Collectifs',
      'subtitle': 'Ventes total',
      'price': '3560.00 CHF',
      'subprice': 'Taux d\'occupation',
    }
    let priveText = {
      'title': 'Cours Prive',
      'subtitle': 'Ventes total',
      'price': '3560.00 CHF',
      'subprice': 'Taux d\'occupation',
    }
    let activityText = {
      'title': 'Activities',
      'subtitle': 'Ventes total',
      'price': '3560.00 CHF',
      'subprice': 'Taux d\'occupation',
    }
    if (event.index === 2 ) {
      this.setUserSessionAnalytics(true);
      this.setPlotly('orange', collectiveText, 'collective3', 262, 500);
      this.setPlotly('green',priveText, 'prive3', 350, 500);
      this.setPlotly('blue', activityText, 'activity3', 350, 500);
    }
  }

  setPlotly(color, text, id, value, maxValue) {

    // Calcular el porcentaje
    const percent = (value / maxValue) * 100;

    const data = [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: value,  // Valor del medidor
        title: { text: "Medidor Semi Circular" },
        type: "indicator",
        mode: "gauge",
        gauge: {
          shape: "angular",
          bar: {
            color: color,
            thickness: 1  // Ajusta el grosor de la barra
          },
          axis: {
            range: [null, maxValue],  // Rango del eje
            showticklabels: false,  // Oculta las etiquetas de las marcas
            ticks: "",  // Oculta los ticks
            showline: true,  // Muestra la línea del eje
            linecolor: "black",  // Color de la línea del eje
            linewidth: 1  // Grosor de la línea del eje
          },
          steps: [
            {
              range: [0, value],
              color: color
            },
            {
              range: [value, maxValue],
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
      height: 300,
      margin: { t: 60, b: 40, l: 40, r: 40 },  // Aumentamos el margen superior (t) para dar espacio al texto
      paper_bgcolor: "rgba(0,0,0,0)",  // Fondo del gráfico transparente
      plot_bgcolor: "rgba(0,0,0,0)",   // Fondo del área del gráfico transparente
      annotations: [  {
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
        pad: { t: 10, r: 10, b: 10, l: 10 }  // Espacio alrededor del texto
      },
        {
          text: text.title,
          font: {
            family: "Dinamit, sans-serif",
            weight: "bold",
            size: 24,
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
          pad: { t: 10, r: 10, b: 10, l: 10 }  // Espacio alrededor del texto
        },
        {
          text: text.subtitle,
          font: {
            family: "Dinamit, sans-serif",
            weight: 'normal',
            size: 16,
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
          pad: { t: 10, r: 10, b: 10, l: 10 }  // Espacio alrededor del texto
        },
        {
          text: text.price,
          font: {
            family: "Dinamit, sans-serif",
            weight: 'bold',
            size: 26,
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
          pad: { t: 10, r: 10, b: 10, l: 10 }  // Espacio alrededor del texto
        },
        {
          text: text.subprice,
          font: {
            family: "Dinamit, sans-serif",
            size: 16,
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
          pad: { t: 10, r: 10, b: 10, l: 10 }  // Espacio alrededor del texto
        }
      ],

    };
    var config = {
      displayModeBar: false,  // Oculta el modo de visualización que incluye el botón de descarga
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d','lasso2d']// Oculta la etiqueta "Produced by Plotly"
    }

    Plotly.newPlot(id, data, layout, config);
  }

  setUserSessionAnalytics(monitors) {
    const trace1 = {
      x: ['2021-04-28', '2021-04-29', '2021-04-30', '2021-05-01', '2021-05-02', '2021-05-03'],
      y: [10, 15, 13, 17, 21, 22],
      mode: 'lines+markers',
      name: 'Users',
      line: {color: 'blue'}
    };

    const trace2 = {
      x: ['2021-04-28', '2021-04-29', '2021-04-30', '2021-05-01', '2021-05-02', '2021-05-03'],
      y: [16, 5, 11, 9, 15, 12],
      mode: 'lines+markers',
      name: 'Sessions',
      line: {color: 'green'}
    };

    const data = [trace1, trace2];

    const layout = {
      title: 'User & Session Analytics',
      xaxis: {
        title: 'Date'
      },
      yaxis: {
        title: 'Count'
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: true,
    };

    if(monitors) {
      Plotly.newPlot('user-session-analytics3', data, layout);
    } else {
      Plotly.newPlot('user-session-analytics', data, layout);
      Plotly.newPlot('user-session-analytics2', data, layout);
    }

  }

  getPercentage(value: number) {
    return (value / this.totalHours) * 100;
  }

  setCourseTypeHours() {
    const data = [{
      values: [3560, 3560, 3560],
      labels: ['Cours Collectifs', 'Cours Privés', 'Activites'],
      type: 'pie'
    }];

    const layout = {
      height: 300,
      title: 'Horas tipo curso'
    };

    Plotly.newPlot('course-type-hours', data, layout);
  }
}
