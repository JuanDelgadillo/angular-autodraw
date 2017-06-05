import { Headers, RequestOptions, Http } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

const API_ENDPOINT = 'https://inputtools.google.com/request?ime=handwriting&app=autodraw&dbg=1&cs=1&oe=UTF-8';
const STENCILS_ENDPOINT = 'src/data/stencils.json';

@Injectable()
export class AutoDrawService {

  stencils;

  constructor(
    private http: Http
  ) { }

  loadStencils () {
    this.http.get(STENCILS_ENDPOINT).subscribe(response => this.stencils = response.json());
  }

  drawSuggestions (
    shapes: Array<Array<number[]>>, drawOptions: {
    canvasWidth: number,
    canvasHeight: number
  }) {
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8'
    });
    let options = new RequestOptions({ headers });

    return this.http.post(
      API_ENDPOINT,
      JSON.stringify({
        input_type: 0,
        requests: [{
          language: 'autodraw',
          writing_guide: {
            "width": drawOptions.canvasWidth,
            "height": drawOptions.canvasHeight
          },
          ink: shapes
        }]
      }),
      options
    ).map(response => {
      let data = response.json();
      let results = JSON.parse(data[1][0][3].debug_info.match(/SCORESINKS: (.*) Service_Recognize:/)[1])
        .map(result => {
          return {
            name: result[0],
            icons: (this.stencils[result[0]] || []).map(collection => collection.src)
          }
        });
      return results;
    });
  }

}
