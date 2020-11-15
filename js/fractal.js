(function (window) {

    window.Fractal = {
        mandelbrot  : buildMandelbrotSet(),
        dendrite    : buildJuliaSet([0, 1]),
        geometric   : geometric,

        buildMandelbrotSet  : buildMandelbrotSet,
        buildJuliaSet       : buildJuliaSet,
    };

    /**
     * buildMandelbrotSet
     * @param d
     * @returns {function(*=): (number|boolean)}
     */
    function buildMandelbrotSet(d)
    {
        d = d || 2;

        return mandelbrot;

        /**
         * mandelbrot
         * @param c
         * @returns {number|boolean}
         */
        function mandelbrot(c)
        {
            return divergesAfter(
                buildPolynomialIterator([0,0], c, d),
                2000,
                2
            );
        }
    }

    /**
     * buildJuliaSet
     * @param cf
     * @param d
     * @returns {function(*=): (number|boolean)}
     */
    function buildJuliaSet(cf, d)
    {
        d = d || 2;

        return julia;

        /**
         * julia
         * @param c
         * @returns {number|boolean}
         */
        function julia(c)
        {
            return divergesAfter(
                buildPolynomialIterator(c, cf, d),
                2000,
                2
            );
        }
    }

    /**
     * geometric
     * @param c
     * @returns {number|null}
     */
    function geometric(c)
    {
        return divergesAfter(
            buildGeometricIterator([1,0], c),
            2000,
            2
        );
    }

    /**
     * buildPolynomialIterator
     * @param z0
     * @param c
     * @param d
     * @returns {function(): *}
     */
    function buildPolynomialIterator(z0, c, d)
    {
        var z = z0;

        return iterate;

        /**
         * iterate
         * @returns {number[]}
         */
        function iterate() {

            z = Math.cplxAdd(Math.cplxPow(z, d), c);

            return z;
        }
    }

    /**
     * buildGeometricIterator
     * @param z0
     * @param c
     * @returns {function(): *}
     */
    function buildGeometricIterator(z0, c)
    {
        var z = z0;

        return iterate;

        /**
         * iterate
         * @returns {number[]}
         */
        function iterate() {

            z = Math.cplxMult(z, c);

            return z;
        }
    }

    /**
     * divergesAfter
     * @param iterator
     * @param maxIterations
     * @param modulusLimit
     * @returns {null|number}
     */
    function divergesAfter(iterator, maxIterations, modulusLimit)
    {
        for (var i = 0; i < maxIterations; i++) {

            if (Math.modulus(iterator()) >= modulusLimit) {
                return i;
            }
        }

        return null;
    }

})(window)
