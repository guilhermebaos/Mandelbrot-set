// Parameters
const threshold = 2
const scale = 0.04      // Multiply every points' coordinates by the scale factor

const allColors = [
    '#0000ff',
    '#00ff00',
    '#ff0000',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
]


// Get the Device Pixel Ratio
const DPR = window.devicePixelRatio

// Get the canvas
const canvas = document.getElementById('mandelbrot-canvas')
const ctx = canvas.getContext('2d')

// Fix the canvas
ctx.scale(DPR, DPR)


// Define a complex number
class ComplexNumber {
    constructor(a, b) {
        this.re = a
        this.im = b
        this.abs = 0
    }

    square() {
        let real = this.re ** 2 - this.im ** 2
        let imag = 2 * this.re * this.im
        
        this.re = real
        this.im = imag
    }

    absolute() {
        this.abs = (this.re ** 2 + this.im ** 2) ** 0.5
    }

    add(z) {
        return new ComplexNumber(this.re + z.re, this.im + z.im)
    }
}


// Define a point in the Complex Plane
class ComplexPoint {
    constructor(a, b, deltaX, deltaY) {
        // Canvas coordinates
        this.canvas = new ComplexNumber(a, b)

        // Coordinates of the point
        this.coord = new ComplexNumber(
            (a - deltaX) * scale,
            -(b - deltaY) * scale
        )

        // Cumulative result coordinates (for the generator function)
        this.result = new ComplexNumber(0, 0)
    }

    // f(z) = z ** 2 + c
    generatorFuntion() {
        // z ** 2
        this.result.square()

        // + c
        this.result = this.coord.add(this.result)

        // |f(z)|
        this.result.absolute()
    }
}


// Select every point on the grid
function start() {
    let width = canvas.width
    let height = canvas.height

    let deltaX = width / 2
    let deltaY = height / 2

    let allPoints = []
    for (let x=0; x < width; x++) {
        for (let y=0; y < height; y++) {
            allPoints.push(new ComplexPoint(x, y, deltaX, deltaY))
        }
    }

    return allPoints
}

const points = start()

let escapePoints = []
function updatePoints() {
    escapePoints = []
    for (let p in points) {
        let point = points[p]
        if (point.result.abs < threshold) {
            point.generatorFuntion()
            if (point.result.abs > threshold) {
                escapePoints.push(point)
            }
        }
    }
}

let currentColor = 0
function colorPoints() {
    color = allColors[currentColor]

    ctx.fillStyle = color
    for (let p in escapePoints) {
        let point = escapePoints[p]
        ctx.fillRect(point.canvas.re, point.canvas.im, 1, 1)
    }

    currentColor++
}

function iterate(times) {
    for (let i=0; i < times; i++) {
        updatePoints()
        colorPoints()
    }
}