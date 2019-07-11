import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, retryWhen, delay, timeout, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

const timeoutVal = 130000;
const delayTime = 1000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  response: string;
  tries = 1;

  constructor(public httpClient: HttpClient) {}

  request(): void {
    this.response = 'START';
    this.httpClient.get('http://localhost:3000').pipe(
      tap((val: any) => {
        if (val.status !== 'COMPLETE') {
          throw val;
        }
        console.log(`OK!`);
      }),
      retryWhen(errors => errors.pipe(
        tap(val => {
          console.log('VALUE: ', val.status);
          if (val.status === 'COMPLETE') {
            throw val;
          }
          console.log(`Retrying...`);
        }),
        delay(delayTime),
      )),
      timeout(timeoutVal),
      catchError(error => throwError(`Request timed out`)),
    ).subscribe((value: any) => {
      const res = value.status;
      this.response = `COMPLETE with response: ${res}`;
    }, error => console.log(error));
  }
}
