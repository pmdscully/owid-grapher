import * as React from "react"
import { computed } from "mobx"
import { observer } from "mobx-react"
import { Bounds } from "grapher/utils/Bounds"
import { VerticalAxis, HorizontalAxis, DualAxis } from "./Axis"
import classNames from "classnames"
import { ControlsOverlay } from "grapher/controls/ControlsOverlay"
import { ScaleSelector } from "grapher/controls/ScaleSelector"

@observer
export class VerticalAxisGridLines extends React.Component<{
    verticalAxis: VerticalAxis
    bounds: Bounds
}> {
    render() {
        const { bounds, verticalAxis } = this.props
        const axis = verticalAxis.clone()
        axis.range = bounds.yRange()

        return (
            <g className={classNames("AxisGridLines", "horizontalLines")}>
                {axis.getTickValues().map((t, i) => {
                    const color = t.faint
                        ? "#eee"
                        : t.value === 0
                        ? "#ccc"
                        : "#d3d3d3"

                    return (
                        <line
                            key={i}
                            x1={bounds.left.toFixed(2)}
                            y1={axis.place(t.value)}
                            x2={bounds.right.toFixed(2)}
                            y2={axis.place(t.value)}
                            stroke={color}
                            strokeDasharray={t.value !== 0 ? "3,2" : undefined}
                        />
                    )
                })}
            </g>
        )
    }
}

@observer
export class HorizontalAxisGridLines extends React.Component<{
    horizontalAxis: HorizontalAxis
    bounds: Bounds
}> {
    render() {
        const { bounds, horizontalAxis } = this.props
        const view = horizontalAxis.clone()
        view.range = bounds.xRange()

        return (
            <g className={classNames("AxisGridLines", "verticalLines")}>
                {view.getTickValues().map((t, i) => {
                    const color = t.faint
                        ? "#eee"
                        : t.value === 0
                        ? "#ccc"
                        : "#d3d3d3"

                    return (
                        <line
                            key={i}
                            x1={view.place(t.value)}
                            y1={bounds.bottom.toFixed(2)}
                            x2={view.place(t.value)}
                            y2={bounds.top.toFixed(2)}
                            stroke={color}
                            strokeDasharray={t.value !== 0 ? "3,2" : undefined}
                        />
                    )
                })}
            </g>
        )
    }
}

interface DualAxisViewProps {
    dualAxis: DualAxis
    highlightValue?: { x: number; y: number }
    showTickMarks: boolean
    isInteractive: boolean
}

@observer
export class DualAxisComponent extends React.Component<DualAxisViewProps> {
    render() {
        const { dualAxis, showTickMarks } = this.props
        const { bounds, xAxis, yAxis, innerBounds } = dualAxis

        const maxX = undefined // {grapherView.tabBounds.width} todo

        return (
            <g className="DualAxisView">
                <HorizontalAxisComponent
                    maxX={maxX}
                    bounds={bounds}
                    axisPosition={innerBounds.bottom}
                    axis={xAxis}
                    showTickMarks={showTickMarks}
                    isInteractive={this.props.isInteractive}
                />
                <VerticalAxisComponent
                    bounds={bounds}
                    verticalAxis={yAxis}
                    isInteractive={this.props.isInteractive}
                />
                {!yAxis.hideGridlines && (
                    <VerticalAxisGridLines
                        verticalAxis={yAxis}
                        bounds={innerBounds}
                    />
                )}
                {!xAxis.hideGridlines && (
                    <HorizontalAxisGridLines
                        horizontalAxis={xAxis}
                        bounds={innerBounds}
                    />
                )}
            </g>
        )
    }
}

@observer
export class VerticalAxisComponent extends React.Component<{
    bounds: Bounds
    verticalAxis: VerticalAxis
    isInteractive: boolean
}> {
    render() {
        const { bounds, verticalAxis } = this.props
        const { ticks, labelTextWrap } = verticalAxis
        const textColor = "#666"

        return (
            <g className="VerticalAxis">
                {labelTextWrap &&
                    labelTextWrap.render(
                        -bounds.centerY - labelTextWrap.width / 2,
                        bounds.left,
                        { transform: "rotate(-90)" }
                    )}
                {ticks.map((tick, i) => (
                    <text
                        key={i}
                        x={(bounds.left + verticalAxis.width - 5).toFixed(2)}
                        y={verticalAxis.place(tick)}
                        fill={textColor}
                        dominantBaseline="middle"
                        textAnchor="end"
                        fontSize={verticalAxis.tickFontSize}
                    >
                        {verticalAxis.formatTick(tick)}
                    </text>
                ))}
            </g>
        )
    }
}

export class HorizontalAxisComponent extends React.Component<{
    bounds: Bounds
    axis: HorizontalAxis
    axisPosition: number
    maxX?: number
    showTickMarks?: boolean
    isInteractive: boolean
}> {
    @computed get controls() {
        const { bounds, axis, maxX } = this.props
        const showControls =
            this.props.isInteractive && axis.scaleTypeOptions.length > 1
        if (!showControls) return undefined

        return (
            <ControlsOverlay id="horizontal-scale-selector" paddingBottom={10}>
                <ScaleSelector
                    maxX={maxX}
                    x={bounds.right}
                    y={bounds.bottom}
                    scaleTypeConfig={axis}
                />
            </ControlsOverlay>
        )
    }

    render() {
        const { bounds, axis, axisPosition, showTickMarks } = this.props
        const { ticks, labelTextWrap: label, labelOffset } = axis
        const textColor = "#666"

        const tickMarks = showTickMarks ? (
            <AxisTickMarks
                tickMarkTopPosition={axisPosition}
                tickMarkXPositions={ticks.map((tick) => axis.place(tick))}
                color="#ccc"
            />
        ) : undefined

        return (
            <g className="HorizontalAxis">
                {label &&
                    label.render(
                        bounds.centerX - label.width / 2,
                        bounds.bottom - label.height
                    )}
                {tickMarks}
                {ticks.map((tick, i) => {
                    const label = axis.formatTick(
                        tick,
                        i === 0 || i === ticks.length - 1
                    )
                    const rawXPosition = axis.place(tick)
                    // Ensure the first label does not exceed the chart viewing area
                    const xPosition =
                        i === 0
                            ? Bounds.getRightShiftForMiddleAlignedTextIfNeeded(
                                  label,
                                  axis.tickFontSize,
                                  rawXPosition
                              ) + rawXPosition
                            : rawXPosition
                    const element = (
                        <text
                            key={i}
                            x={xPosition}
                            y={bounds.bottom - labelOffset}
                            fill={textColor}
                            textAnchor="middle"
                            fontSize={axis.tickFontSize}
                        >
                            {label}
                        </text>
                    )

                    return element
                })}
                {this.controls}
            </g>
        )
    }
}

export class AxisTickMarks extends React.Component<{
    tickMarkTopPosition: number
    tickMarkXPositions: number[]
    color: string
}> {
    render() {
        const { tickMarkTopPosition, tickMarkXPositions, color } = this.props
        const tickSize = 4
        const tickBottom = tickMarkTopPosition + tickSize
        return tickMarkXPositions.map((tickMarkPosition, index) => {
            return (
                <line
                    key={index}
                    x1={tickMarkPosition}
                    y1={tickMarkTopPosition}
                    x2={tickMarkPosition}
                    y2={tickBottom}
                    stroke={color}
                />
            )
        })
    }
}
