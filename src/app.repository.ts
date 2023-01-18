import { Observable, of } from 'rxjs';
export interface AppRepository {
  put(hash: string, url: string): Observable<string>;
  get(hash: string): Observable<string>;
}
export const AppRepositoryTag = 'AppRepository';
export class AppRepositoryHashmap implements AppRepository {
  private readonly hashMap: Map<string, string>;
  constructor() {
    this.hashMap = new Map<string, string>();
  }

  get(hash: string): Observable<string> {
    return of(this.hashMap.get(hash));
  }

  put(hash: string, url: string): Observable<string> {
    return of(this.hashMap.set(hash, url).get(hash));
  }
}
