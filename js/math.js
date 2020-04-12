(function(Math) {

    Math.cplxAdd    = cplxAdd;
    Math.cplxMult   = cplxMult;
    Math.cplxPow    = cplxPow;
    Math.modulus    = modulus;

    /**
     * cplxAdd
     * @param z1
     * @param z2
     * @returns {number[]}
     */
    function cplxAdd(z1,z2)
    {
        return [
            z1[0]+z2[0],
            z1[1]+z2[1]
        ];
    }

    /**
     * cplxMult
     * @param z1
     * @param z2
     * @returns {number[]}
     */
    function cplxMult(z1,z2)
    {
        return [
            z1[0]*z2[0]-z1[1]*z2[1],
            z1[0]*z2[1]+z1[1]*z2[0]
        ];
    }

    /**
     * cplxPow
     * @param z
     * @param n
     * @returns {number[]}
     */
    function cplxPow(z, n)
    {
        if (n === 0) {
            return [1, 0];
        }

        if (n === 1) {

            return z;
        }

        var p = z;

        for (var i=2; i<=n; i++) {
            p = Math.cplxMult(p, z);
        }

        return p;
    }

    /**
     * modulus
     * @param z
     * @returns {number}
     */
    function modulus(z)
    {
        return Math.sqrt(z[0]*z[0]+z[1]*z[1]);
    }

})(Math);
