import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import * as SvgPanZoom from 'svg-pan-zoom';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('svg') 
  private elSvg : ElementRef;
  private rect: any;
  drawing = false;
  private lastPoint = null;

  constructor(private renderer:Renderer2) {}

  ngOnInit() {
    let svgPanZoom: SvgPanZoom.Instance = SvgPanZoom('#draw-svg', {
      zoomEnabled: true,
      controlIconsEnabled: false,
      fit: true,
      center: true
    });
  }

  ngAfterViewInit() {
    this.rect = this.elSvg.nativeElement.getBoundingClientRect();
    this.elSvg.nativeElement.addEventListener('mousedown', (e) => this.mouseDownEvent(e));
    this.elSvg.nativeElement.addEventListener('mousemove', (e) => this.mouseOverEvent(e));
  }

  draw() {
    this.drawing = !this.drawing;
    this.lastPoint = null;
  }

  private mouseDownEvent(event) {
    if (!this.drawing) {
      return;
    }
    const pt = this.getMousePosition(event);
    let circle = this.renderer.createElement('circle', 'svg');
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "#000");
    circle.setAttribute("cx", pt.x);
    circle.setAttribute("cy", pt.y);
    circle.setAttribute("r", 5);
    this.renderer.appendChild(document.querySelector('.svg-pan-zoom_viewport'), circle);
    // this.renderer.appendChild(this.elSvg.nativeElement, circle);

    if (!this.lastPoint) {
      this.lastPoint = {...pt};
    } else {
      const strPath = `M${this.lastPoint.x} ${this.lastPoint.y} L${pt.x} ${pt.y}`;
      let path = this.renderer.createElement('path', 'svg');
      path.setAttribute("stroke", '#000');
      path.setAttribute("d", strPath);
      this.renderer.appendChild(document.querySelector('.svg-pan-zoom_viewport'), path);
      // this.renderer.appendChild(this.elSvg.nativeElement, path);
      this.lastPoint = {...pt};
    }
  }

  private mouseOverEvent(event) {
    if (!this.drawing) {
      return;
    }
    // <path d="M171 81 L175 217" stroke="#000" />
    // console.log(event);
  }

  private getMousePosition(e) {
    return {
        x: e.pageX - this.rect.left,
        y: e.pageY - this.rect.top
    }
  };
}
