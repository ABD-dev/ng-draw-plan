import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  Renderer2
} from '@angular/core';
import * as SvgPanZoom from 'svg-pan-zoom';
import * as Hammer from 'hammerjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('svg')
  private elSvg: ElementRef;
  private rect: any;
  private lastPoint = null;
  private offset = {
    x: 0,
    y: 0
  };
  private scale = 1;
  
  drawing = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    let svgPanZoom: SvgPanZoom.Instance = SvgPanZoom('#draw-svg', {
      zoomEnabled: true,
      controlIconsEnabled: false,
      fit: true,
      center: true,
      onZoom: scale => {
        this.offset = svgPanZoom.getPan();
        this.scale = scale;
      },
      onPan: newPan => {
        this.offset = newPan;
      },
      customEventsHandler: {
        haltEventListeners: [
          'touchstart',
          'touchend',
          'touchmove',
          'touchleave',
          'touchcancel'
        ],
        init: function(options) {
          var instance = options.instance,
            initialScale = 1,
            pannedX = 0,
            pannedY = 0;

          this.hammer = Hammer(options.svgElement, {
            inputClass: Hammer.SUPPORT_POINTER_EVENTS
              ? Hammer.PointerEventInput
              : Hammer.TouchInput
          });

          this.hammer.get('pinch').set({ enable: true });

          this.hammer.on('doubletap', function(ev) {
            instance.zoomIn();
          });

          this.hammer.on('panstart panmove', function(ev) {
            if (ev.type === 'panstart') {
              pannedX = 0;
              pannedY = 0;
            }

            instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
            pannedX = ev.deltaX;
            pannedY = ev.deltaY;
          });

          this.hammer.on('pinchstart pinchmove', function(ev) {
            if (ev.type === 'pinchstart') {
              initialScale = instance.getZoom();
              instance.zoomAtPoint(initialScale * ev.scale, {
                x: ev.center.x,
                y: ev.center.y
              });
            }

            instance.zoomAtPoint(initialScale * ev.scale, {
              x: ev.center.x,
              y: ev.center.y
            });
          });
          options.svgElement.addEventListener('touchmove', function(e) {
            e.preventDefault();
          });
        },
        destroy: function() {}
      }
    });
  }

  ngAfterViewInit() {
    this.rect = this.elSvg.nativeElement.getBoundingClientRect();
    this.elSvg.nativeElement.addEventListener('mousedown', e =>
      this.mouseDownEvent(e)
    );
    this.elSvg.nativeElement.addEventListener('touchstart', e =>
      this.mouseDownEvent(e)
    );
    // this.elSvg.nativeElement.addEventListener('mousemove', e =>
    //   this.mouseOverEvent(e)
    // );
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
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#000');
    circle.setAttribute('cx', pt.x);
    circle.setAttribute('cy', pt.y);
    circle.setAttribute('r', 5);
    this.renderer.appendChild(
      document.querySelector('.svg-pan-zoom_viewport'),
      circle
    );
    // this.renderer.appendChild(this.elSvg.nativeElement, circle);

    if (!this.lastPoint) {
      this.lastPoint = { ...pt };
    } else {
      const strPath = `M${this.lastPoint.x} ${this.lastPoint.y} L${pt.x} ${
        pt.y
      }`;
      let path = this.renderer.createElement('path', 'svg');
      path.setAttribute('stroke', '#000');
      path.setAttribute('d', strPath);
      this.renderer.appendChild(
        document.querySelector('.svg-pan-zoom_viewport'),
        path
      );
      // this.renderer.appendChild(this.elSvg.nativeElement, path);
      this.lastPoint = { ...pt };
    }
  }

  private mouseOverEvent(e) {
    // if (!this.drawing) {
    //   return;
    // }
    // <path d="M171 81 L175 217" stroke="#000" />
  }

  private getMousePosition(e) {
    return {
      x: (e.pageX - this.rect.left - this.offset.x) / this.scale,
      y: (e.pageY - this.rect.top - this.offset.y) / this.scale
    };
  }
}
