var mplan = frame;

/**
 * frame
 * @param selector
 * @param options
 */
function frame(selector, options) {

    var canvas = document.querySelector(selector);

    if (null === canvas || 'CANVAS' !== canvas.nodeName) {
        return;
    }

    options = options || {};

    var frame = buildFrame(canvas, options);

    canvas.getFrame = getFrame;

    /**
     * buildFrame
     * @param element
     * @param opts
     * @returns {{setOption: setOption, setScale: setScale, setDrawAxis: setDrawAxis, setCenter: setCenter, setDefaultColor: setDefaultColor, getOption: (function(*): *), getMinMax: (function(): number[]), draw: (function(): frame), setRadius: setRadius}}
     */
    function buildFrame(element, opts)
    {
        var transformMatrix = new DOMMatrix();

        setTransform(1, 0, 0, -1, element.width / 2, element.height / 2);

        // Default options
        var options = {
            scale           : opts.scale            ? opts.scale        : [1, 1],
            ppup            : opts.ppup             ? opts.ppup         : [1, 1],
            center          : opts.center           ? opts.center       : [0, 0],
            radius          : opts.radius           ? opts.radius       : 1,
            drawAxis        : 'drawAxis' in opts    ? !!opts.drawAxis   : true,
            defaultColor    : opts.defaultColor     ? opts.defaultColor : '#000000',
            zoom            : null
        };

        options.defaultScale    = options.scale;

        var drawFn      = noop,
            drawObject  = buildDrawObject()
        ;

        var frame = {

            setScale : function(value) {
                setOption('scale', value);
                setOption('zoom', [
                    value[0] / getOption('defaultScale')[0],
                    value[1] / getOption('defaultScale')[1],
                ]);
                this.setCenter(getOption('center'));
            },

            setZoom : function(value) {
                setOption('zoom', value);
                setOption('scale', [
                    getOption('defaultScale')[0] * value[0],
                    getOption('defaultScale')[1] * value[1],
                ]);
                this.setCenter(getOption('center'));
            },

            setCenter : function(value) {

                setOption('center', value);

                var c = applyScale(value, getOption('scale'));

                var matrix2d = getTransform();

                matrix2d.e = (element.width / 2) - (matrix2d.a * c[0]);
                matrix2d.f = (element.height / 2) - (matrix2d.d * c[1]);

                setTransform(matrix2d);
            },

            setRadius : function(value) {
                setOption('radius', value);
            },

            setDrawAxis : function(value) {
                setOption('drawAxis', !!value);
            },

            setDefaultColor : function(value) {
                setOption('defaultColor', value);
            },

            setOption : setOption,

            getOption : getOption,

            getCanvas : function() {
                return element;
            },

            transformGlobalToLocal : transformGlobalToLocal,

            transformLocalToGlobal : transformLocalToGlobal,

            getMinMax : getMinMax,

            draw : function() {

                console.log('%cDrawing...', 'font-weight:800;');
                console.log('Origin', '[', getOption('center')[0], ',', getOption('center')[1], ']');
                console.log('Zoom', 'x', getOption('zoom')[0]);

                if (arguments.length) {

                    if (typeof arguments[0] === 'function') {
                        drawFn = arguments[0];
                    }
                } else {
                    drawObject.clear();
                    drawFn(drawObject);
                    drawAxis(drawObject);
                }

                return this;
            }
        };

        // Update transform matrix
        frame.setCenter(getOption('center'));

        // Initialize zoom value
        frame.setScale(getOption('scale'));

        // Add event listeners on canvas
        canvas.addEventListener('click',        addListenerOnZoom('in'));
        canvas.addEventListener('contextmenu',  addListenerOnZoom('out'));

        return frame;

        /**
         * onZoom
         * @param direction
         * @returns {function(*): void}
         */
        function addListenerOnZoom(direction)
        {
            if (direction !== 'in' && direction !== 'out') {
                direction = 'in';
            }

            return onZoom;

            /**
             * onZoom
             * @param event
             */
            function onZoom(event)
            {
                event.stopPropagation();
                event.preventDefault();

                var p = transformGlobalToLocal([
                    event.offsetX,
                    event.offsetY,
                ]);

                var zoom = (direction === 'out') ? [getOption('zoom')[0] / 2, getOption('zoom')[0] / 2]
                    : [2 * getOption('zoom')[0], 2 * getOption('zoom')[0]];

                frame.setCenter(p);
                frame.setZoom(zoom);
                frame.draw();
            }
        }

        /**
         * setOption
         * @param name
         * @param value
         */
        function setOption(name, value)
        {
            if (name in options) {
                options[name] = value;
            }
        }

        /**
         * getOption
         * @param name
         * @returns {*}
         */
        function getOption(name)
        {
            return name in options ? options[name] : null;
        }

        /**
         * getContext
         * @returns {ImageBitmapRenderingContext | WebGLRenderingContext | WebGL2RenderingContext | CanvasRenderingContext2D | RenderingContext | OffscreenRenderingContext | OffscreenCanvasRenderingContext2D}
         */
        function getContext()
        {
            return element.getContext('2d');
        }

        /**
         * setTransform
         * @param a
         * @param b
         * @param c
         * @param d
         * @param e
         * @param f
         */
        function setTransform(a, b, c, d, e, f)
        {
            if (a instanceof DOMMatrix) {
                transformMatrix = a;
                return;
            }

            transformMatrix = new DOMMatrix(arguments);
        }

        /**
         * getTransform
         * @returns {DOMMatrix}
         */
        function getTransform()
        {
            return transformMatrix;
        }

        /**
         * noop
         */
        function noop() {
            console.log('noop');
        }

        /**
         * drawAxis
         */
        function drawAxis()
        {
            if (!getOption('drawAxis')) {
                return;
            }

            var minMax = getMinMax();

            var xmin = minMax[0],
                xmax = minMax[1],
                ymin = minMax[2],
                ymax = minMax[3];

            var context = getContext();

            var xstart  = transformLocalToGlobal([xmin, 0]),
                xend    = transformLocalToGlobal([xmax, 0]),
                ystart  = transformLocalToGlobal([0, ymin]),
                yend    = transformLocalToGlobal([0, ymax]);

            // draw axis
            context.strokeStyle = getOption('defaultColor');
            context.beginPath();
            context.moveTo(xstart[0]    , xstart[1]);
            context.lineTo(xend[0]      , xend[1]);
            context.moveTo(ystart[0]    , ystart[1]);
            context.lineTo(yend[0]      , yend[1]);

            // draw graduation
            var i, pstart, pend;

            for (i=Math.floor(xmin) ; i<xmax ; i++) {

                pstart  = transformLocalToGlobal([i, -0.05]);
                pend    = transformLocalToGlobal([i, 0.05]);
                context.moveTo(pstart[0],pstart[1]);
                context.lineTo(pend[0]  ,pend[1]);
            }

            for (i=Math.floor(ymin) ; i<ymax ; i++) {

                pstart  = transformLocalToGlobal([-0.05, i]);
                pend    = transformLocalToGlobal([0.05, i]);
                context.moveTo(pstart[0],pstart[1]);
                context.lineTo(pend[0]  ,pend[1]);
            }

            context.stroke();
        }

        /**
         *
         * @param p
         * @param scale
         * @returns {number[]}
         */
        function applyScale(p, scale)
        {
            return [p[0] * scale[0], p[1] * scale[1]];
        }

        /**
         * transformLocalToGlobal
         */
        function transformLocalToGlobal(p)
        {
            var scale = getOption('scale');

            p = applyScale(p, scale);

            var matrix2d = getTransform();

            // @see https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-settransform
            return [
                matrix2d.a * p[0] + matrix2d.e,
                matrix2d.d * p[1] + matrix2d.f,
            ];
        }

        /**
         * transformGlobalToLocal
         * @param p
         * @returns {number[]}
         */
        function transformGlobalToLocal(p)
        {
            var matrix2d = getTransform();

            // @see https://html.spec.whatwg.org/multipage/canvas.html#dom-context-2d-settransform
            p = [
                (p[0] - matrix2d.e) / matrix2d.a,
                (p[1] - matrix2d.f) / matrix2d.d,
            ];

            var scale = getOption('scale');

            return applyScale(p, [1 / scale[0], 1 / scale[1]]);
        }

        /**
         * getMinMax
         * @returns {number[]}
         */
        function getMinMax() {

            var min = transformGlobalToLocal([0, 0]);
            var max =  transformGlobalToLocal([element.width, element.height]);

            var x_min, x_max, y_min, y_max;

            if (min[0] < max[0]) {
                x_min = min[0];
                x_max = max[0];
            } else {
                x_min = max[0];
                x_max = min[0];
            }

            if (min[1] < max[1]) {
                y_min = min[1];
                y_max = max[1];
            } else {
                y_min = max[1];
                y_max = min[1];
            }

            return [x_min, x_max, y_min, y_max];
        }

        /**
         * buildDrawObject
         * @returns {{getFrame: (function(): {setOption: setOption, setScale: setScale, setDrawAxis: setDrawAxis, setCenter: setCenter, getOption: (function(*): *), getMinMax: (function(): [number, number, number, number]), draw: (function(): frame), setRadius: setRadius}), clear: clear, point: point}}
         */
        function buildDrawObject()
        {
            return {

                clear : function clear() {
                    getContext().clearRect(0, 0, element.width, element.height);
                },

                point : function point(p, color) {

                    color = color ? color : getOption('defaultColor');

                    var context = getContext();

                    context.fillStyle = color;
                    context.fillRect(p[0], p[1], getOption('radius'), getOption('radius'))
                },

                getFrame : function() {
                    return frame;
                }
            };
        }
    }

    /**
     * getFrame
     * @returns {{setOption: setOption, setScale: setScale, setDrawAxis: setDrawAxis, setCenter: setCenter, getOption: (function(*): *), getMinMax: (function(): number[]), draw: draw, setRadius: setRadius}}
     */
    function getFrame() {
        return frame;
    }
};

export default mplan;
