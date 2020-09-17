import React from "react"
import { observer } from "mobx-react"
import { Bounds } from "grapher/utils/Bounds"
import { Grapher } from "grapher/core/Grapher"
import { computed } from "mobx"
import { ChartTypeMap, ChartTypeName } from "grapher/chart/ChartTypes"

interface FacetChartProps {
    width: number
    height: number
    number: number
    padding: number
    chartTypeName: ChartTypeName
    grapher: Grapher
}

@observer
export class FacetChart extends React.Component<FacetChartProps> {
    @computed get smallCharts() {
        const { grapher, chartTypeName } = this.props
        const charts = this.bounds.split(
            this.props.number || 1,
            this.props.padding
        )
        const ChartType = ChartTypeMap[chartTypeName] as any

        return charts.map((bounds: Bounds, index: number) => (
            <ChartType key={index} bounds={bounds} grapher={grapher} />
        ))
    }

    @computed get bounds() {
        const { width, height } = this.props
        return new Bounds(0, 0, width, height)
    }

    render() {
        const { width, height } = this.props
        return (
            <svg width={width} height={height}>
                {this.smallCharts}
            </svg>
        )
    }
}
