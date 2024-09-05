import { Component, ElementRef, HostBinding, Input } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { ConfigService } from '../../config/config.service';
import { map, startWith, switchMap } from 'rxjs/operators';
import { NavigationService } from '../../services/navigation.service';
import { PopoverService } from '../../components/popover/popover.service';
import { MegaMenuComponent } from '../../components/mega-menu/mega-menu.component';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTaskComponent } from './add-task/add-task.component';
import { duration } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ColorSchemeName} from '../../config/colorSchemeName';
@Component({
  selector: 'vex-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @Input() mobileQuery: boolean;

  @Input()
  @HostBinding('class.shadow-b')
  hasShadow: boolean;

  navigationItems = this.navigationService.items;
  flag: any = 'flag:spain';
  isHorizontalLayout$: Observable<boolean> = this.configService.config$.pipe(map(config => config.layout === 'horizontal'));
  isVerticalLayout$: Observable<boolean> = this.configService.config$.pipe(map(config => config.layout === 'vertical'));
  isNavbarInToolbar$: Observable<boolean> = this.configService.config$.pipe(map(config => config.navbar.position === 'in-toolbar'));
  isNavbarBelowToolbar$: Observable<boolean> = this.configService.config$.pipe(map(config => config.navbar.position === 'below-toolbar'));
  userVisible$: Observable<boolean> = this.configService.config$.pipe(map(config => config.toolbar.user.visible));
  isDarkMode: boolean;
  megaMenuOpen$: Observable<boolean> = of(false);

  constructor(private layoutService: LayoutService,
              private configService: ConfigService,
              private navigationService: NavigationService,
              private popoverService: PopoverService,
              private router: Router,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              private translateService: TranslateService) {

    this.isDarkMode = this.getThemePreference() === 'dark';
    this.setColor();
    switch(translateService.getDefaultLang()) {
                  case 'es':
                    this.flag = 'flag:spain';
                  break;
                  case 'de':
                    this.flag = 'flag:germany';
                  break;
                  case 'it':
                    this.flag = 'flag:italy';
                  break;
                  case 'fr':
                    this.flag = 'flag:france';
                  break;
                  case 'en':
                    this.flag = 'flag:uk';
                  break;
                }
              }

  openQuickpanel(): void {
    this.layoutService.openQuickpanel();
  }

  setThemePreference(isDarkMode: boolean): void {
    sessionStorage.setItem('themePreference', isDarkMode ? 'dark' : 'light');
  }

  getThemePreference(): string {
    //return sessionStorage.getItem('themePreference') || 'light';
    return 'light';
  }

  toggleDarkMode(): void {
    this.setColor();
    this.setThemePreference(this.isDarkMode);
  }

  setColor(): void {
    const colorScheme = this.isDarkMode ? ColorSchemeName.dark : ColorSchemeName.light;
    this.configService.updateConfig({ style: { colorScheme } });
  }

  openSidenav(): void {
    this.layoutService.openSidenav();
  }

  changeLang(flag: string, lang: string) {

    this.flag = flag;

    if (this.translateService.getLangs().indexOf(lang) !== -1) {

      this.translateService.use(lang);
      this.translateService.currentLang = lang;
    } else {

      this.translateService.setDefaultLang(lang);
      this.translateService.currentLang = lang;
    }
  }

  openMegaMenu(origin: ElementRef | HTMLElement): void {
    this.megaMenuOpen$ = of(
      this.popoverService.open({
        content: MegaMenuComponent,
        origin,
        offsetY: 12,
        position: [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
        ]
      })
    ).pipe(
      switchMap(popoverRef => popoverRef.afterClosed$.pipe(map(() => false))),
      startWith(true),
    );
  }

  openSearch(): void {
    this.layoutService.openSearch();
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  addTask() {
    const dialog = this.dialog.open(AddTaskComponent, {
    });

    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.snackbar.open(this.translateService.instant('task_created'), 'OK', {duration: 3000})
      }
    })
  }
}
