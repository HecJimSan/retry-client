import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, retryWhen, delay, timeout, catchError } from 'rxjs/operators';
import { of, throwError, Subject, Observable, merge, combineLatest } from 'rxjs';
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
  responseCombine: any;
  tries = 0;
  timeLeft = timeoutVal;
  timeMax: number;
  remainTime: number;
  interval;
  intervalJoin;
  input1Re: boolean;
  input2Re: boolean;

  input1: number;
  input2: number;
  loading: number;
  isValid: boolean;

  value1:any;
  value2:any;


  constructor(public httpClient: HttpClient) { }

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

  requestJoin(): void {
    this.init();

    const observable1: Observable<{}> = this.httpClient.get(`http://localhost:3000/request1/${this.input1}`);
    const observable2: Observable<{}> = this.httpClient.get(`http://localhost:3000/request2/${this.input2}`);

    observable1.subscribe((value)=> {
      this.value1 = value;
      this.input1Re = true;
    });
    observable2.subscribe((value)=> {
      this.value2 = value;
      this.input2Re = true;
    });
    combineLatest(observable1, observable2).subscribe((value) => {
      this.resetTimerJoin();
      this.responseCombine = value;
      this.isValid = true;
    }, () => this.isValid = false);
  }

  collectNumber1($event: string): void {
    this.input1 = +$event * 1000;
  }
  collectNumber2($event: string): void {
    this.input2 = +$event * 1000;
  }

  private init(): void{
    this.value1 = this.value2 = undefined;
    this.input1Re = this.input2Re = false;
    this.timeMax = Math.max(this.input1, this.input2);
    this.responseCombine = undefined;
    this.startCounting();
  }

  private startCounting(): void {
    this.remainTime = 0;
    this.intervalJoin = setInterval(() => {
      if (this.remainTime < this.timeMax) {
        this.remainTime++;
      } else {
        this.remainTime = this.timeMax;
      }
    }, 1000);
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

  private resetTimerJoin(): void {
    clearInterval(this.intervalJoin);
  }

  private resetTimer(): void {
    clearInterval(this.interval);
    this.timeLeft = timeoutVal;
    this.tries = 0;
  }
}
