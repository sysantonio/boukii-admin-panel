import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';
import { UserService } from './userService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirestore } from '@angular/fire/firestore';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { ApiCrudService } from './crud.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from 'src/@vex/config/config.service';
import { SchoolService } from './school.service';
import { defaultConfig } from 'src/@vex/config/configs';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {
  user: User | null = null;

  constructor(private router: Router, http: HttpClient, private crudService: ApiCrudService, private snackbar: MatSnackBar,
    private schoolService: SchoolService, private configService: ConfigService) {
    super(http)
    const user = JSON.parse(localStorage.getItem('boukiiUser'));
    if (user) {
      this.user = user;
    }

    /*onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
        localStorage.setItem('boukiiUser', JSON.stringify(user));
      } else {
        this.user = null;
        localStorage.removeItem('boukiiUser');
      }
    });*/
  }

  async login(email: string, password: string) {
    try {

      this.crudService.login('/admin/login', {email: email, password: password})
        .subscribe((data: any) => {

          localStorage.setItem('boukiiUser', JSON.stringify(data.data.user));
          localStorage.setItem('boukiiUserToken', JSON.stringify(data.data.token));
          this.user = data.data.user;

          this.schoolService.getSchoolData(this.user)
            .subscribe((data) => {
              defaultConfig.imgSrc = data.data.logo;
              this.configService.updateConfig({
                sidenav: {
                  imageUrl: data.data.logo,
                  title: data.data.name,
                  showCollapsePin: false
                }
              });
              this.router.navigate(['/home']);

            })

        }, (error) => {
          this.snackbar.open('Error con las credenciales', 'OK', {duration: 3000});
        })
    } catch (error) {
      this.snackbar.open('Error con las credenciales', 'OK', {duration: 3000});
    }
  }

  async logout() {
    this.user = null;
    localStorage.removeItem('boukiiUser');
  }

  isLoggedIn() {
    return this.user !== null;
  }

}
