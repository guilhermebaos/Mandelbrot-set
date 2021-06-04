// Parameters
const scale = 0.04      // Multiply every points' coordinates by the scale factor


// Get the Device Pixel Ratio
const DPR = window.devicePixelRatio

// Get the canvas
const canvas = document.getElementById('mandelbrot-canvas')
const ctx = canvas.getContext('2d')

// Fix the canvas
ctx.scale(DPR, DPR)


// Define a point in the Complex Plane
class ComplexPoint {
    constructor(a, b) {
        // Coordinates of the point
        this.coordA = a
        this.coordB = b

        // Cumulative result coordinates (for the generator function)
        this.resultA = 0
        this.resultB = 0
        this.resultAbs = 0
    }

    squareComplex(a, b) {
        let real = a ** 2 - b ** 2
        let imag = 2 * a * b
        return real, imag
    }

    absoluteComplex(a, b) {
        return (a ** 2 + b ** 2) ** 0.5
    }

    // f(z) = z**2 + c
    generatorFuntion() {
        // Square z
        this.resultA, this.resultB = this.squareComplex(this.resultA, this.resultB)

        // Add c
        this.resultA += this.coordA
        this.resultB += this.coordB

        // See the absolute value of the result, to color the canas
        this.resultAbs = this.absoluteComplex(this.resultA, this.resultB)
    }
}


// Select every point on the grid
function start() {
    let width = canvas.width
    let height = canvas.height

    let halfWidth = width / 2
    let halfHeight = height / 2

    let allPoints = []
    for (let x=0; x < width; x++) {
        for (let y=0; y < height; y++) {
            let xResult = (x - halfWidth) * scale
            let yResult = (y - halfHeight) * scale
            allPoints.push(new ComplexPoint(xResult, yResult))
        }
    }

    return allPoints
}

const points = start()

function iterate() {

}

function color()