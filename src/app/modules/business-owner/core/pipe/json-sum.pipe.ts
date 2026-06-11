import { Pipe, PipeTransform } from '@angular/core';
import { FaqCategory } from '../interfaces/i-support';

@Pipe({ name: 'jsonSum', standalone: true })
export class JsonSumPipe implements PipeTransform {
  transform(cats: FaqCategory[]): number {
    return cats.reduce((acc, c) => acc + c.count, 0);
  }
}