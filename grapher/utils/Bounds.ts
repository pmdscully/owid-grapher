import { range } from "grapher/utils/Util"
import { Vector2 } from "grapher/utils/Vector2"
import pixelWidth from "string-pixel-width"

// Important utility class for all visualizations
// Since we want to be able to render charts headlessly and functionally, we
// can't rely on the DOM to do these calculations for us, and instead must
// calculate using geometry and first principles
export class Bounds {
    static textBoundsCache: { [key: string]: Bounds } = {}
    static ctx: CanvasRenderingContext2D

    static fromProps(props: {
        x: number
        y: number
        width: number
        height: number
    }): Bounds {
        const { x, y, width, height } = props
        return new Bounds(x, y, width, height)
    }

    static fromBBox(bbox: {
        x: number
        y: number
        width: number
        height: number
    }): Bounds {
        return this.fromProps(bbox)
    }

    static fromRect(rect: ClientRect) {
        return new Bounds(rect.left, rect.top, rect.width, rect.height)
    }

    static fromElement(el: HTMLElement) {
        return Bounds.fromRect(el.getBoundingClientRect())
    }

    static fromCorners(p1: Vector2, p2: Vector2) {
        const x1 = Math.min(p1.x, p2.x)
        const x2 = Math.max(p1.x, p2.x)
        const y1 = Math.min(p1.y, p2.y)
        const y2 = Math.max(p1.y, p2.y)

        return new Bounds(x1, y1, x2 - x1, y2 - y1)
    }

    // Merge a collection of bounding boxes into a single encompassing Bounds
    static merge(boundsList: Bounds[]): Bounds {
        let x1 = Infinity,
            y1 = Infinity,
            x2 = -Infinity,
            y2 = -Infinity
        for (const b of boundsList) {
            x1 = Math.min(x1, b.x)
            y1 = Math.min(y1, b.y)
            x2 = Math.max(x2, b.x + b.width)
            y2 = Math.max(y2, b.y + b.height)
        }
        return Bounds.fromCorners(new Vector2(x1, y1), new Vector2(x2, y2))
    }

    static getRightShiftForMiddleAlignedTextIfNeeded(
        label: string,
        fontSize: number,
        xPosition: number
    ) {
        const bounds = Bounds.forText(label, {
            fontSize,
        })
        const overflow = xPosition - Math.ceil(bounds.width / 2)
        return overflow < 0 ? Math.abs(overflow) : 0
    }

    static empty(): Bounds {
        return new Bounds(0, 0, 0, 0)
    }

    static forText(
        str: string = "",
        {
            x = 0,
            y = 0,
            fontSize = 16,
            fontWeight = 400,
        }: {
            x?: number
            y?: number
            fontSize?: number
            fontWeight?: number
            fontFamily?: string
        } = {}
    ): Bounds {
        // Collapse contiguous spaces into one
        str = str.replace(/ +/g, " ")
        const key = `${str}-${fontSize}`
        let bounds = this.textBoundsCache[key]
        if (bounds) {
            if (bounds.x === x && bounds.y === y - bounds.height) return bounds
            else return bounds.extend({ x: x, y: y - bounds.height })
        }

        if (str === "") bounds = Bounds.empty()
        else {
            const width = pixelWidth(str, {
                font: "arial",
                size: fontSize,
                bold: fontWeight >= 600,
            })
            const height = fontSize
            bounds = new Bounds(x, y - height, width, height)
        }

        this.textBoundsCache[key] = bounds
        return bounds
    }

    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.width = Math.max(width, 0)
        this.height = Math.max(height, 0)
    }

    get left(): number {
        return this.x
    }
    get top(): number {
        return this.y
    }
    get right(): number {
        return this.x + this.width
    }
    get bottom(): number {
        return this.y + this.height
    }
    get centerX(): number {
        return this.x + this.width / 2
    }
    get centerY(): number {
        return this.y + this.height / 2
    }
    get centerPos(): Vector2 {
        return new Vector2(this.centerX, this.centerY)
    }
    get area(): number {
        return this.width * this.height
    }

    get topLeft(): Vector2 {
        return new Vector2(this.left, this.top)
    }
    get topRight(): Vector2 {
        return new Vector2(this.right, this.top)
    }
    get bottomLeft(): Vector2 {
        return new Vector2(this.left, this.bottom)
    }
    get bottomRight(): Vector2 {
        return new Vector2(this.right, this.bottom)
    }

    padLeft(amount: number): Bounds {
        return new Bounds(
            this.x + amount,
            this.y,
            this.width - amount,
            this.height
        )
    }

    padRight(amount: number): Bounds {
        return new Bounds(this.x, this.y, this.width - amount, this.height)
    }

    padBottom(amount: number): Bounds {
        return new Bounds(this.x, this.y, this.width, this.height - amount)
    }

    padTop(amount: number): Bounds {
        return new Bounds(
            this.x,
            this.y + amount,
            this.width,
            this.height - amount
        )
    }

    padWidth(amount: number): Bounds {
        return new Bounds(
            this.x + amount,
            this.y,
            this.width - amount * 2,
            this.height
        )
    }

    padHeight(amount: number): Bounds {
        return new Bounds(
            this.x,
            this.y + amount,
            this.width,
            this.height - amount * 2
        )
    }

    fromLeft(amount: number): Bounds {
        return this.padRight(this.width - amount)
    }

    fromBottom(amount: number): Bounds {
        return this.padTop(this.height - amount)
    }

    pad(amount: number): Bounds {
        return new Bounds(
            this.x + amount,
            this.y + amount,
            this.width - amount * 2,
            this.height - amount * 2
        )
    }

    extend(props: {
        x?: number
        y?: number
        width?: number
        height?: number
    }): Bounds {
        return Bounds.fromProps({ ...this, ...props })
    }

    scale(scale: number): Bounds {
        return new Bounds(
            this.x * scale,
            this.y * scale,
            this.width * scale,
            this.height * scale
        )
    }

    intersects(otherBounds: Bounds): boolean {
        const r1 = this
        const r2 = otherBounds

        return !(
            r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top
        )
    }

    lines(): Vector2[][] {
        return [
            [this.topLeft, this.topRight],
            [this.topRight, this.bottomRight],
            [this.bottomRight, this.bottomLeft],
            [this.bottomLeft, this.topLeft],
        ]
    }

    boundedPoint(p: Vector2): Vector2 {
        return new Vector2(
            Math.max(Math.min(p.x, this.right), this.left),
            Math.max(Math.min(p.y, this.bottom), this.top)
        )
    }

    containsPoint(x: number, y: number): boolean {
        return (
            x >= this.left &&
            x <= this.right &&
            y >= this.top &&
            y <= this.bottom
        )
    }

    contains(p: Vector2) {
        return this.containsPoint(p.x, p.y)
    }

    encloses(bounds: Bounds) {
        return (
            this.containsPoint(bounds.left, bounds.top) &&
            this.containsPoint(bounds.left, bounds.bottom) &&
            this.containsPoint(bounds.right, bounds.top) &&
            this.containsPoint(bounds.right, bounds.bottom)
        )
    }

    toCSS(): { left: string; top: string; width: string; height: string } {
        return {
            left: `${this.left}px`,
            top: `${this.top}px`,
            width: `${this.width}px`,
            height: `${this.height}px`,
        }
    }

    toProps(): { x: number; y: number; width: number; height: number } {
        return { x: this.x, y: this.y, width: this.width, height: this.height }
    }

    toArray(): [[number, number], [number, number]] {
        return [
            [this.left, this.top],
            [this.right, this.bottom],
        ]
    }

    xRange(): [number, number] {
        return [this.left, this.right]
    }

    split(pieces: number, padding = 0): Bounds[] {
        // Splits a rectangle into smaller rectangles.
        // The Facet Storybook has a visual demo of how this works.
        // I form the smallest possible square and then fill that up. This always goes left to right, top down.
        // So when we don't have a round number we first add a column, then a row, etc, until we reach the next square.
        // In the future we may want to position these bounds in custom ways, but this only does basic splitting for now.
        // NB: The off-by-one-pixel scenarios have NOT yet been unit tested. Karma points for the person who adds those tests and makes
        // any required adjustments.
        const columns = Math.ceil(Math.sqrt(pieces))
        const rows = Math.ceil(pieces / columns)
        const columnPadding = padding
        const rowPadding = padding
        const contentWidth = this.width - columnPadding * (columns - 1)
        const contentHeight = this.height - rowPadding * (rows - 1)
        const boxWidth = Math.floor(contentWidth / columns)
        const boxHeight = Math.floor(contentHeight / rows)
        return range(0, pieces).map(
            (index: number) =>
                new Bounds(
                    (index % columns) * (boxWidth + columnPadding),
                    Math.floor(index / columns) * (boxHeight + rowPadding),
                    boxWidth,
                    boxHeight
                )
        )
    }

    yRange(): [number, number] {
        return [this.bottom, this.top]
    }

    equals(bounds: Bounds) {
        return (
            this.x === bounds.x &&
            this.y === bounds.y &&
            this.width === bounds.width &&
            this.height === bounds.height
        )
    }

    // Calculate squared distance between a given point and the closest border of the bounds
    // If the point is within the bounds, returns 0
    private distanceToPointSq(p: Vector2) {
        if (this.contains(p)) return 0

        const cx = Math.max(Math.min(p.x, this.x + this.width), this.x)
        const cy = Math.max(Math.min(p.y, this.y + this.height), this.y)
        return (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy)
    }

    distanceToPoint(p: Vector2) {
        return Math.sqrt(this.distanceToPointSq(p))
    }
}
