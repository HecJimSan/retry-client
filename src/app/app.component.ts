import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, retryWhen, delay, timeout, catchError } from 'rxjs/operators';
import { of, throwError, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

const timeoutVal = environment.timeout;
const delayTime = environment.delay;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  response: string;
  tries = 0;
  timeLeft = timeoutVal;
  interval;


  constructor(public httpClient: HttpClient) {}

  request(): void {
    this.response = 'START';
    this.startTimer();
    this.httpClient.get('http://localhost:3000').pipe(
      tap((val: any) => {
        if (val.status !== 'COMPLETE') {
          throw val;
        }

        this.resetTimer();
        console.log(`OK!`);
      }),
      retryWhen(errors => errors.pipe(
        tap(val => {
          console.log('VALUE: ', val.status);
          if (val.status === 'COMPLETE') {
            throw val;
          }
          this.tries++;
          console.log(`Retrying...`);
        }),
        delay(delayTime),
      )),
      timeout(timeoutVal),
      catchError(error => throwError(`Request timed out`)),
    ).subscribe((value: any) => {
      const res = value.status;
      this.response = `${res}`;
    }, error => {
      this.resetTimer();
      console.log(error);
    });
  }

  private startTimer(): void {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = timeoutVal;
      }
    }, 1);
  }

  private resetTimer(): void {
    clearInterval(this.interval);
    this.timeLeft = timeoutVal;
    this.tries = 0;
  }
}
