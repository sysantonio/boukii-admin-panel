import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BonusesCreateUpdateComponent} from '../bonuses/bonuses-create-update/bonuses-create-update.component';
import {Color, ScaleType} from '@swimlane/ngx-charts';
import Plotly from 'plotly.js-dist-min'

@Component({
  selector: 'vex-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit{

  salesData = [
    { name: 'Cours Collectifs', value: 3560 },
    { name: 'Cours Privés', value: 3560 },
    { name: 'Activites', value: 3560 },
    { name: 'Bonos regalo', value: 3560 }
  ];

  collectiveCoursesData = [
    { name: 'Cours Collectifs', value: 3560 }
  ];

  privateCoursesData = [
    { name: 'Cours Privés', value: 3560 }
  ];

  activitiesData = [
    { name: 'Activites', value: 3560 }
  ];

  giftVoucherData = [
    { name: 'Bonos regalo', value: 3560 }
  ];

  activeMonitorsData = [
    { name: 'Monitores Activos', value: 23, max:100 }
  ];

  workedHoursData = [
    { name: 'Horas trabajadas', value: 6780 }
  ];

  sportHoursData = [
    { name: 'Horas por deporte', value: 6780 }
  ];

  courseTypeHoursData = [
    { name: 'Cours Collectifs', value: 3560 },
    { name: 'Cours Privés', value: 3560 },
    { name: 'Activites', value: 3560 }
  ];

  colorScheme: Color = {
    name: 'myScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  thresholds = {
    '0': { color: '#C7B42C' },
    '75': { color: '#5AA454' },
    '90': { color: '#A10A28' }
  };

  valueFormatting = (value: number): string => {
    return `${value}%`;
  }

  constructor() { }

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
      width: 400,
      height: 400,
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
}
