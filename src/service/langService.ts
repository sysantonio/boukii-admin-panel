import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  constructor(private matSnackBar: MatSnackBar, private router: Router) { }

}
