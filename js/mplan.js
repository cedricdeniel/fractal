(function(window) {

    window.mplan = frame;

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
            getContext().setTransform(1, 0, 0, -1, element.width / 2, element.height / 2);

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
                drawObject  = buildDrawObject(),
                viewport    = buildViewport()
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

                    var c = transformLocalToGlobal(value);

                    var matrix = getContext().getTransform();

                    matrix.e = (element.width / 2) - c[0];
                    matrix.f = (element.height / 2) + c[1];

                    getContext().setTransform(matrix);
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

                getMinMax : function() {
                    return viewport.getMinMax();
                },

                draw : function() {

                    viewport = buildViewport();

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

                    var matrix = getContext().getTransform();

                    var p1 = [matrix.a * (event.offsetX - matrix.e), matrix.d * (event.offsetY - matrix.f)];

                    var p = transformGlobalToLocal(p1);

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

                var minMax = viewport.getMinMax();

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

                return applyScale(p, scale);
            }

            /**
             * transformGlobalToLocal
             * @param p
             * @returns {number[]}
             */
            function transformGlobalToLocal(p)
            {
                var scale = getOption('scale');

                return applyScale(p, [1 / scale[0], 1 / scale[1]]);
            }

            /**
             * buildDrawObject
             * @returns {{getFrame: (function(): {setOption: setOption, setScale: setScale, setDrawAxis: setDrawAxis, setCenter: setCenter, getOption: (function(*): *), getMinMax: (function(): [number, number, number, number]), draw: (function(): frame), setRadius: setRadius}), clear: clear, point: point}}
             */
            function buildDrawObject()
            {
                return {

                    clear : function clear() {

                        var context = getContext();

                        var matrix = context.getTransform();

                        context.setTransform(1, 0, 0, 1, 0, 0);

                        context.clearRect(0, 0, element.width, element.height);

                        context.setTransform(matrix);
                    },

                    point : function point(p, color) {

                        color = color ? color : getOption('defaultColor');

                        p = transformLocalToGlobal(p);

                        var context = getContext();

                        context.fillStyle = color;
                        context.fillRect(p[0], p[1], getOption('radius'), getOption('radius'))
                    },

                    getFrame : function() {
                        return frame;
                    }
                };
            }

            /**
             * buildViewport
             * @returns {{min: number[], max: number[], getMinMax: (function(): [number, number, number, number])}}
             */
            function buildViewport()
            {
                var matrix = getContext().getTransform()

                var min = [matrix.a * (0 - matrix.e), matrix.d * (0 - matrix.f)];
                var max = [matrix.a * (element.width - matrix.e), matrix.d * (element.height - matrix.f)];

                return {

                    min : transformGlobalToLocal(min),

                    max : transformGlobalToLocal(max),

                    getMinMax : function() {

                        var x_min, x_max, y_min, y_max;

                        if (this.min[0] < this.max[0]) {
                            x_min = this.min[0];
                            x_max = this.max[0];
                        } else {
                            x_min = this.max[0];
                            x_max = this.min[0];
                        }

                        if (this.min[1] < this.max[1]) {
                            y_min = this.min[1];
                            y_max = this.max[1];
                        } else {
                            y_min = this.max[1];
                            y_max = this.min[1];
                        }

                        return [x_min, x_max, y_min, y_max];
                    }
                }
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

})(window);
