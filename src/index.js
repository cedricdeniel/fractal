import './main.scss';

import './js/math';
import Fractal from "./js/fractal";
import mplan from './js/mplan';

var options = {
    scale       : [300, 300],
    ppup        : [.8, .8], // Points per unit percent
    center      : [-0.5, 0],
    radius      : 1,
    drawAxis    : false,
};

mplan('#plan', options);

formControl(document.querySelector('form'), options);

// Form control
function formControl(form, opts)
{
    var options = opts || {};

    var inptDrawAxis = form.querySelector('#inpt-draw-axis');

    inptDrawAxis.checked = options.drawAxis;

    inptDrawAxis.addEventListener('click', function(event) {

        event.stopPropagation();

        // Do not prevent default otherwise input is never checked
        // event.preventDefault();

        var mFrame = canvas.getFrame();

        mFrame.setDrawAxis(inptDrawAxis.checked);

        // Delay draw call to avoid delay on input checking behaviour
        window.setTimeout(function() {
            mFrame.draw();
        });
    });
}

var canvas  = document.querySelector('#plan');

var drawNoop = draw(function() {});
var drawGeometric = draw(fractalShape(Fractal.geometric));
var drawMandelbrot = draw(fractalShape(Fractal.mandelbrot));
var drawDendrite = draw(fractalShape(Fractal.dendrite));

drawMandelbrot();

document.querySelector('#btn-draw-reset').addEventListener('click', drawNoop);
document.querySelector('#btn-draw-geom').addEventListener('click', drawGeometric);
document.querySelector('#btn-draw-mbrot').addEventListener('click', drawMandelbrot);
document.querySelector('#btn-draw-julia-1').addEventListener('click', drawDendrite);
document.querySelector('#btn-draw-julia-2').addEventListener('click', draw(fractalShape(Fractal.buildJuliaSet([-1.476, 0]))));
document.querySelector('#btn-draw-julia-3').addEventListener('click', draw(fractalShape(Fractal.buildJuliaSet([-.8, 0]))));
document.querySelector('#btn-draw-julia-4').addEventListener('click', draw(fractalShape(Fractal.buildJuliaSet([0.285, 0.013]))));

/**
 * draw
 * @param shapeFn
 */
function draw(shapeFn)
{
    return _draw;

    /**
     * _draw
     * @returns void
     */
    function _draw()
    {
        canvas
            .getFrame()
            .draw(shapeFn)
            .draw()
        ;
    }
}

/**
 * fractalShape
 * @param fractalFn
 */
function fractalShape(fractalFn)
{
    return drawingFractal;

    /**
     * drawingFractal
     * @param draw
     * @param fractalFn
     */
    function drawingFractal(draw)
    {
        var mFrame      = draw.getFrame();
        var size        = mFrame.getCanvas().getBoundingClientRect();
        var ppup        = mFrame.getOption('ppup');

        var deltaX = Math.round(1 / ppup[0]);
        var deltaY = Math.round(1 / ppup[1]);

        var points = [];

        for (var threadX = 0; threadX < size.width; threadX += deltaX) {

            for (var threadY = 0; threadY < size.height; threadY += deltaY) {

                var p = mFrame.transformGlobalToLocal([threadX, threadY]);

                var rank = fractalFn(p);

                if (null === rank) {
                    continue;
                }

                if (undefined === points[rank]) {
                    points[rank] = [];
                }

                points[rank].push([threadX, threadY]);
            }
        }

        var totalCount = points.reduce(countTotal, 0);

        var cumulativeCount = 0;

        points.map(drawPoints);

        /**
         * countTotal
         * @param count
         * @param rank
         * @returns {number}
         */
        function countTotal(count, rank)
        {
            return count + (Array.isArray(rank) ? rank.length : 0);
        }

        /**
         * drawPoints
         * @param points
         */
        function drawPoints(points)
        {
            if (!Array.isArray(points) || 0 === points.length) {
                return;
            }

            cumulativeCount += points.length;

            var color = calcColor(cumulativeCount / totalCount);

            points.map(function(p) {
                draw.point([p[0], p[1]], color);
            });
        }
    }
}

/**
 * calcColor
 * @param percent
 * @returns {string}
 */
function calcColor(percent)
{
    var startColor = [2, 1, 0],
        endColor = [8, .7, .8];

    var h, s, l;

    h = (Math.round(percent * (endColor[0]-startColor[0])) + startColor[0]) % 360;
    s = Math.round((percent * (endColor[1]-startColor[1]) + startColor[1]) * 100);
    l = Math.round((percent * (endColor[2]-startColor[2]) + startColor[2]) * 100);

    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
