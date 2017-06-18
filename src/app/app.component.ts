import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AutoDrawService } from './services';
import 'rxjs/add/observable/fromEvent';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor (
    private autoDrawService: AutoDrawService
  ) {}

  @ViewChild('canvas') canvas;

  drawSuggestions: Array<object>;

  canvasMouseEventSubscriptions: Subscription[];

  previousXAxis: number = 0;
  previousYAxis: number = 0;
  currentXAxis:  number = 0;
  currentYAxis:  number = 0;

  context;
  pressedAt: number;
  pressing:  boolean = false;
  currentShape: Array<number[]>;
  shapes: Array<Array<number[]>> = [];
  intervalLastPosition: number[] = [-1, -1];

  ngOnInit () {
    this.autoDrawService.loadStencils();
    this.context = this.canvas.nativeElement.getContext('2d');
    let mouseEvents = ['mousemove', 'mousedown', 'mouseup', 'mouseout'];

    this.canvasMouseEventSubscriptions = mouseEvents.map(
      (mouseEvent: string) => Observable
        .fromEvent(this.canvas.nativeElement, mouseEvent)
        .subscribe((event: MouseEvent) => this.draw(event))
    );
  }

  ngOnDestroy () {
    for (let mouseEventSubscription of this.canvasMouseEventSubscriptions) {
      mouseEventSubscription.unsubscribe();
    }
  }

  eraseCanvas () {
    this.shapes = [];
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  prepareNewShape () {
    this.currentShape = [
      [], // X coordinates
      [], // Y coordinates
      []  // Times
    ];
  }

  storeCoordinates() {
    if (this.intervalLastPosition[0] !== this.previousXAxis && this.intervalLastPosition[1] !== this.previousYAxis) {
      this.intervalLastPosition = [this.previousXAxis, this.previousYAxis];
      this.currentShape = [
        [...this.currentShape[0], this.previousXAxis],
        [...this.currentShape[1], this.previousYAxis],
        [...this.currentShape[2], Date.now() - this.pressedAt]
      ];
    }
  }

  onDrawingMouseDown (mouseEvent: MouseEvent) {
    let highlightStartPoint, drawColorStartingPoint = 'black';

    this.previousXAxis = this.currentXAxis;
    this.previousYAxis = this.currentYAxis;
    this.currentXAxis = mouseEvent.clientX - this.canvas.nativeElement.offsetLeft;
    this.currentYAxis = mouseEvent.clientY - this.canvas.nativeElement.offsetTop;

    this.pressing = true;
    this.pressedAt = Date.now();
    highlightStartPoint = true;

    this.prepareNewShape();

    if (highlightStartPoint) {
      this.context.beginPath();
      this.context.fillStyle = drawColorStartingPoint;
      this.context.fillRect(this.currentXAxis, this.currentYAxis, 2, 2);
      this.context.closePath();
      highlightStartPoint = false;
    }

    // Stores coordinates every 9ms
    return window.setInterval(() => this.storeCoordinates(), 9);
  }

  onDrawingMouseMove (mouseEvent: MouseEvent) {
    let drawStroke = 8, drawColor  = 'black';

    this.previousXAxis = this.currentXAxis;
    this.previousYAxis = this.currentYAxis;
    this.currentXAxis = mouseEvent.clientX - this.canvas.nativeElement.offsetLeft;
    this.currentYAxis = mouseEvent.clientY - this.canvas.nativeElement.offsetTop;

    this.context.beginPath();
    this.context.moveTo(this.previousXAxis, this.previousYAxis);
    this.context.lineTo(this.currentXAxis, this.currentYAxis);
    this.context.strokeStyle = drawColor;
    this.context.fillStyle = drawColor;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.lineWidth = drawStroke;
    this.context.stroke();
    this.context.closePath();
  }

  draw(mouseEvent: MouseEvent) {
    let storeCoordinateInterval;

    if (mouseEvent.type === 'mousedown') {
      storeCoordinateInterval = this.onDrawingMouseDown(mouseEvent);
    }

    if (mouseEvent.type === 'mouseup' || this.pressing && mouseEvent.type === 'mouseout') {
      this.pressing = false;
      clearInterval(storeCoordinateInterval);
      this.commitCurrentShape();
    }

    if (mouseEvent.type === 'mousemove' && this.pressing) {
      this.onDrawingMouseMove(mouseEvent);
    }
  }

  commitCurrentShape() {
    this.shapes.push(this.currentShape);
    let drawOptions = {
      canvasWidth: this.canvas.nativeElement.width,
      canvasHeight: this.canvas.nativeElement.height
    };

    this.autoDrawService.drawSuggestions(this.shapes, drawOptions)
      .subscribe(suggestions => this.drawSuggestions = suggestions);
  }

  pickSuggestion(source: string) {
    this.eraseCanvas();
    let image = new Image();
    image.onload = () => this.context.drawImage(image, 0, 0);
    image.src = source;
  }

}
