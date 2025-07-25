import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatDrawer, MatDrawerMode } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { MailComposeComponent } from '../components/mail-compose/mail-compose.component';
import { UntypedFormControl } from '@angular/forms';
import { MailService } from '../services/mail.service';
import { ConfigService } from 'src/@vex/config/config.service';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { LayoutService } from 'src/@vex/services/layout.service';


@UntilDestroy()
@Component({
  selector: 'vex-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss'],
  animations: [
    scaleIn400ms,
    fadeInRight400ms
  ],
  encapsulation: ViewEncapsulation.None
})
export class MailComponent implements OnInit {

  isDesktop$ = this.layoutService.isDesktop$;
  ltLg$ = this.layoutService.ltLg$;
  drawerMode$: Observable<MatDrawerMode> = this.isDesktop$.pipe(
    map(isDesktop => isDesktop ? 'side' : 'over')
  );
  isVerticalLayout$: Observable<boolean> = this.configService.select(config => config.layout === 'vertical');

  drawerOpen = true;

  searchCtrl = new UntypedFormControl();

  @ViewChild(MatDrawer, { static: true }) private drawer: MatDrawer;

  constructor(private layoutService: LayoutService,
              private mailService: MailService,
              private readonly configService: ConfigService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    /**
     * Expand Drawer when we switch from mobile to desktop view
     */
    this.isDesktop$.pipe(
      untilDestroyed(this)
    ).subscribe(isDesktop => {
      if (isDesktop) {
        this.drawer?.open();
      } else {
        this.drawer?.close();
      }
    });

    this.searchCtrl.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => this.mailService.filterValue.next(value));
  }

  openCompose() {
    const dialog = this.dialog.open(MailComposeComponent, {
      width: '100%',
      maxWidth: 1800
    });

    dialog.afterClosed().subscribe((data) => {
      this.mailService.getData();
    })
  }
}
