import { Component, Inject, LOCALE_ID, Renderer2 } from '@angular/core';
import { ConfigService } from '../@vex/config/config.service';
import { Settings } from 'luxon';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { NavigationService } from '../@vex/services/navigation.service';
import { LayoutService } from '../@vex/services/layout.service';
import { ActivatedRoute } from '@angular/router';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SplashScreenService } from '../@vex/services/splash-screen.service';
import { VexConfigName } from '../@vex/config/config-name.model';
import { ColorSchemeName } from '../@vex/config/colorSchemeName';
import { MatIconRegistry, SafeResourceUrlWithIconOptions } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ColorVariable, colorVariables } from '../@vex/components/config-panel/color-variables';

@Component({
  selector: 'vex-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private configService: ConfigService,
              private renderer: Renderer2,
              private platform: Platform,
              @Inject(DOCUMENT) private document: Document,
              @Inject(LOCALE_ID) private localeId: string,
              private layoutService: LayoutService,
              private route: ActivatedRoute,
              private navigationService: NavigationService,
              private splashScreenService: SplashScreenService,
              private readonly matIconRegistry: MatIconRegistry,
              private readonly domSanitizer: DomSanitizer) {
    Settings.defaultLocale = this.localeId;

    if (this.platform.BLINK) {
      this.renderer.addClass(this.document.body, 'is-blink');
    }

    this.matIconRegistry.addSvgIconResolver(
      (
        name: string,
        namespace: string
      ): SafeResourceUrl | SafeResourceUrlWithIconOptions | null => {
        switch (namespace) {
          case 'mat':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/material-design-icons/two-tone/${name}.svg`
            );

          case 'logo':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/logos/${name}.svg`
            );

          case 'flag':
            return this.domSanitizer.bypassSecurityTrustResourceUrl(
              `assets/img/icons/flags/${name}.svg`
            );
        }
      }
    );

    /**
     * Customize the template to your needs with the ConfigService
     * Example:
     *  this.configService.updateConfig({
     *    sidenav: {
     *      title: 'Custom App',
     *      imageUrl: '//placehold.it/100x100',
     *      showCollapsePin: false
     *    },
     *    footer: {
     *      visible: false
     *    }
     *  });
     */

    /**
     * Config Related Subscriptions
     * You can remove this if you don't need the functionality of being able to enable specific configs with queryParams
     * Example: example.com/?layout=apollo&style=default
     */
    this.route.queryParamMap.subscribe(queryParamMap => {
      if (queryParamMap.has('layout')) {
        this.configService.setConfig(queryParamMap.get('layout') as VexConfigName);
      }

      if (queryParamMap.has('style')) {
        this.configService.updateConfig({
          style: {
            colorScheme: queryParamMap.get('style') as ColorSchemeName
          }
        });
      }

      if (queryParamMap.has('primaryColor')) {
        const color: ColorVariable = colorVariables[queryParamMap.get('primaryColor')];

        if (color) {
          this.configService.updateConfig({
            style: {
              colors: {
                primary: color
              }
            }
          });
        }
      }

      if (queryParamMap.has('rtl')) {
        this.configService.updateConfig({
          direction: coerceBooleanProperty(queryParamMap.get('rtl')) ? 'rtl' : 'ltr'
        });
      }
    });

    /**
     * Add your own routes here
     */
    this.navigationService.items = [
      /*{
        type: 'link',
        label: 'Dashboard',
        route: '/dashboard',
        icon: 'mat:insights',
        routerLinkActiveOptions: { exact: true }
      },*/

      {
        type: 'subheading',
        label: 'Gestion',
        children: [
          {
            type: 'link',
            label: 'Home',
            route: '/home',
            icon: '../assets/img/icons/home-2.png',
            icon_active: '../assets/img/icons/home.svg',
            routerLinkActiveOptions: { exact: true }
          },
          {
            type: 'link',
            label: 'Planification',
            route: '/timeline',
            icon: '../assets/img/icons/planificador-2.png',
            icon_active: '../assets/img/icons/planificador.svg',

            routerLinkActiveOptions: { exact: true }
          },/*
          {
            type: 'link',
            label: 'Calendrier',
            route: '/calendar',
            icon: 'mat:calendar_today',
            routerLinkActiveOptions: { exact: true }
          },*/
          {
            type: 'link',
            label: 'Reservations',
            route: '/bookings',
            icon: '../assets/img/icons/reservas-2.svg',
            icon_active: '../assets/img/icons/reservas.svg',
            routerLinkActiveOptions: { exact: true }
          },
          {
            type: 'link',
            label: 'Courses',
            route: '/courses',
            icon: '../assets/img/icons/cursos-2.svg',
            icon_active: '../assets/img/icons/cursos.svg',
            routerLinkActiveOptions: { exact: true }
          },
          {
            type: 'link',
            label: "Bons d'achat",
            route: '/bonuses',
            icon: '../assets/img/icons/bonos-2.svg',
            icon_active: '../assets/img/icons/bonos.svg',
            routerLinkActiveOptions: { exact: true }
          },
          {
            type: 'link',
            label: 'Communication',
            route: '/messages',
            icon: '../assets/img/icons/comunicacion-2.svg',
            icon_active: '../assets/img/icons/comunicacion.svg',
            routerLinkActiveOptions: { exact: true }
          },
          {
            type: 'link',
            label: 'Statistiques',
            route: '/stats',
            icon: '../assets/img/icons/stats-2.svg',
            icon_active: '../assets/img/icons/stats.svg',
            routerLinkActiveOptions: { exact: true }
          }
        ]
      },
      // Otra seccion
      {
        type: 'subheading',
        label: 'Personees',
        children: [
          {
            type: 'link',
            label: 'Moniteurs',
            route: '/monitors',
            icon: '../assets/img/icons/monitores-3.svg',
            icon_active: '../assets/img/icons/monitores-2.svg',
            routerLinkActiveOptions: { exact: true }
          },
          {
            type: 'link',
            label: 'Clients',
            route: '/clients',
            icon: '../assets/img/icons/clientes2.svg',
            icon_active: '../assets/img/icons/clientes.svg',
            routerLinkActiveOptions: { exact: true }
          },
          {
            type: 'link',
            label: 'Administrateurs',
            route: '/admins',
            icon: '../assets/img/icons/admin.svg',
            icon_active: '../assets/img/icons/Admins.svg',
            routerLinkActiveOptions: { exact: true }
          }
        ]
      },
      {
        type: 'subheading',
        label: 'Configuration',
        children: [{
          type: 'link',
          label: 'Boukii Pay',
          route: 'https://login.pay.boukii.com/fr/',
          icon: '../assets/img/icons/boukii-pay.png',
          routerLinkActiveOptions: { exact: true }
        },
        {
          type: 'link',
          label: 'Réglages',
          route: '/settings',
          icon: '../assets/img/icons/reglajes-2.svg',
          icon_active: '../assets/img/icons/reglajes.svg',
          routerLinkActiveOptions: { exact: true }
        }]
      }

    ];
  }
}
