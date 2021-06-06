// PARAMETERS ---------
const threshold = 2         // Limit above which we assume the point diverges

// Window size
const initialScale = 0.006  // Multiply every points' coordinates by the scale factor

// Animation and color
const animDelay = 1         // Animation delay for multiple iterations
const colorStep = 2         // Speed at which the color changes (at least 1)



// HTML CONSTANTS ---------

// Get the canvas
const canvas = document.getElementById('mandelbrot-canvas')

// Get the canvas' properties
const canvasWidth = canvas.width
const canvasHeight = canvas.height

// Get the canvas context
const ctx = canvas.getContext('2d')


// Select the sliders
const zoomInSpeed = document.getElementById('zoomInSpeed')

const sliderTransX = document.getElementById('transX')
const sliderTransY = document.getElementById('transY')
const sliderScale = document.getElementById('zoom')



// ZOOM IN AND OUT
function zoomOnPoint(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left,
        y = event.clientY - rect.top
    sliderTransX.value = sliderTransX.value * 1 + (canvasWidth / 2 - x) / (sliderScale.value * 1)
    sliderTransY.value = sliderTransY.value * 1 + (canvasHeight / 2 - y) / (sliderScale.value * 1)
    sliderScale.value *= (zoomInSpeed.value *1)
    start()
    iterate(100)
}
  
canvas.addEventListener("mousedown", (event) => { zoomOnPoint(canvas, event) });

function zoomOut() {
    sliderScale.value /= (zoomInSpeed.value *1)
    start()
    iterate(100)
}



// COMPLEX NUMBERS ---------

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



// DRAWING THE AXIS ---------

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
function drawAxis(canvasWidth, canvasHeight, deltaX, deltaY) {
    let arrowHeadOffset = 20

    // Real Axis
    drawArrow(0, deltaY, canvasWidth - arrowHeadOffset, deltaY, '#000000')

    // Imaginary Axis
    drawArrow(deltaX, canvasHeight, deltaX, 0 + arrowHeadOffset, '#000000')

    ctx.fillStyle = '#fafafa'
    ctx.font = '20px serif'
    ctx.fillText('Imaginary Axis', deltaX + arrowHeadOffset, arrowHeadOffset)
    ctx.fillText('Real Axis', canvasWidth - 5 * arrowHeadOffset, deltaY + arrowHeadOffset)
}



// CALCULATE AND COLOR POINTS IN THE MANDELBROT SET ---------

// Select every point on the grid
let points, scale, translateX, translateY
let queue = 0
function start() {
    // Restart the iterations queue
    queue = 0
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Window settings
    let zoom = (sliderScale.value * 1)
    
    scale = initialScale / zoom
    translateX = (sliderTransX.value * 1) * zoom
    translateY = (sliderTransY.value * 1) * zoom

    let deltaX = canvasWidth / 2 + translateX
    let deltaY = canvasHeight / 2 + translateY

    // Draw the complex plane axis
    drawAxis(canvasWidth, canvasHeight, deltaX, deltaY)

    // Get all points in the canvas
    let allPoints = []
    for (let x=0; x < canvasWidth; x++) {
        for (let y=0; y < canvasHeight; y++) {
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


// See if a color is above or below the maximum
function aboveOrBelow(num, dir=1, min=25, max=255) {
    if (num < min) return 1
    else if (num > max) return -1

    return dir
}

// Color the points according to the parameters and how fast they diverge
let currentColor = [0, 0, 255]
let currentStep = [colorStep + 2, colorStep + 1, colorStep + 0]
let currentDirection = [1, 1, -1]
function colorPoints() {
    // Current color
    color = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`

    // Color the points who escaped right now
    ctx.fillStyle = color
    for (let p in escapePoints) {
        let point = escapePoints[p]
        ctx.fillRect(point.canvas.re, point.canvas.im, 1, 1)
    }

    // Update the color
    currentColor[0] += currentStep[0] * currentDirection[0]
    currentColor[1] += currentStep[1] * currentDirection[1]
    currentColor[2] += currentStep[2] * currentDirection[2]


    // Switch the direction in which we add color
    currentDirection[0] = aboveOrBelow(currentColor[0], currentDirection[0])
    currentDirection[1] = aboveOrBelow(currentColor[1], currentDirection[1])
    currentDirection[2] = aboveOrBelow(currentColor[2], currentDirection[2], 100)
}

// Do a step
function step() {
    updatePoints()
    colorPoints()
}

// Iterate many steps
function iterate(times=0) {
    queue += times

    if (points === undefined) {
        alert('Loading...')
        return
    }

    if (queue <= 0) {
        return
    }
    queue -= 1

    step()
    setTimeout(() => {
        iterate()
    }, animDelay)
}

start()
setTimeout(() => {
    iterate(100)
}, 2000)