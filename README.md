# Fractal
Project inspired by Mickaël Launay's video ["À la découverte de l'ensemble de Mandelbrot"](https://www.youtube.com/watch?v=dQeIUrLKM9s)
## How to use
```shell
# on windows, use powershell, not git-bash
$ docker run -it --rm -v ${PWD}:/tmp -w /tmp node:16.0.0 npm install
$ docker run -it --rm -v ${PWD}:/tmp -w /tmp node:16.0.0 npm run build:dev
$ docker run -it --rm -v ${PWD}:/tmp -w /tmp node:16.0.0 npm run build:deploy
```
