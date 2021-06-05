// Parameters
const threshold = 2     // Limit above which we assume the point diverges

// Window size
let scale = 0.0075      // Multiply every points' coordinates by the scale factor
let translateX = -70
let translateY = -70

// Animation and color
const animDelay = 0.25  // Animation delay for multiple iterations
const colorStep = 6     // Speed at which the color changes


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


// Draw an arrow
function drawArrow(x0, y0, xFinal, yFinal, color) {
    // Arrow parameters
    let bodyWidth = 4
    let headHeight = 10

    ctx.strokeStyle = color
    ctx.fillStyle = color

    // The end of the arrow is in the right position
    if (xFinal == x0) {
        xFinal += 0
    } else if (xFinal > x0) {
        xFinal += headHeight + 1
    } else {
        xFinal -= headHeight + 1
    }

    if (yFinal == y0) {
        yFinal += 0
    } else if (yFinal > y0) {
        yFinal += headHeight + 1
    } else {
        yFinal -= headHeight + 1
    }

    let angle = Math.atan2(yFinal - y0, xFinal - x0)

    // Arrow Body
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(xFinal, yFinal)
    ctx.lineWidth = bodyWidth
    ctx.stroke()
    
    // One side of the arrow head
    ctx.beginPath()
    ctx.moveTo(xFinal, yFinal)
    ctx.lineTo(xFinal - headHeight * Math.cos(angle - Math.PI/7), yFinal - headHeight * Math.sin(angle - Math.PI/7))
    
    // Other side
    ctx.lineTo(xFinal - headHeight * Math.cos(angle + Math.PI/7), yFinal - headHeight * Math.sin(angle + Math.PI/7))
    
    // From one side to the center and then to the other side of the arrow head
    ctx.lineTo(xFinal, yFinal)
    ctx.lineTo(xFinal - headHeight * Math.cos(angle - Math.PI/7), yFinal - headHeight * Math.sin(angle - Math.PI/7))

    // Stroke the paths
    ctx.lineWidth = bodyWidth
    ctx.stroke()
    ctx.fill()
}


// Draw the real and imaginary axis
function drawAxis(width, height, deltaX, deltaY) {
    let arrowHeadOffset = 20

    drawArrow(deltaX, height, deltaX, 0 + arrowHeadOffset, '#000000')
    drawArrow(0, deltaY, width - 160, deltaY, '#000000')

    ctx.fillStyle = '#fafafa'
    ctx.fillText('Imaginary Axis', deltaX + 10, 5 + arrowHeadOffset)
    ctx.fillText('Real Axis', width - 210, deltaY + 15)
}



// Select every point on the grid
let points
function start() {
    let width = canvas.width
    let height = canvas.height
    
    ctx.clearRect(0, 0, width, height)

    let deltaX = width / 2 + translateX
    let deltaY = height / 2 + translateY

    drawAxis(width, height, deltaX, deltaY)

    let allPoints = []
    for (let x=0; x < width; x++) {
        for (let y=0; y < height; y++) {
            allPoints.push(new ComplexPoint(x, y, deltaX, deltaY))
        }
    }

    points = allPoints
}

// All points that will diverge instead of converge
let escapePoints
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

// Color the points according to the parameters and how fast they diverge
let currentColor = [0, 0]
let currentDirection = [1, 1]
function colorPoints() {
    color = `rgb(${currentColor[0]}, ${currentColor[1]}, 255)`

    ctx.fillStyle = color
    for (let p in escapePoints) {
        let point = escapePoints[p]
        ctx.fillRect(point.canvas.re, point.canvas.im, 1, 1)
    }

    currentColor[0] += colorStep * currentDirection[0]
    currentColor[1] += Math.ceil(colorStep * Math.PI / 4) * currentDirection[1]


    // Switch the direction in which we add color
    if (currentColor[0] + colorStep > 255) {
        currentDirection[0] = -1
    }
    if (currentColor[1] + colorStep > 255) {
        currentDirection[1] = -1
    }

    
    if (currentColor[0] - colorStep < 0) {
        currentDirection[0] = 1
    }
    if (currentColor[1] - colorStep < 0) {
        currentDirection[1] = 1
    }
}

// Do a step
function step() {
    updatePoints()
    colorPoints()
}

// Iterate many steps
function iterate(times=0) {
    if (points === undefined) {
        alert('Loading...')
        return
    }

    if (times <= 0) {
        console.log('Done!')
        return
    }

    step()
    setTimeout(() => {
        iterate(times - 1)
    }, animDelay)
}

start()