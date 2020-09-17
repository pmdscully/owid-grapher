import { computed } from "mobx"
import {
    identity,
    cloneDeep,
    sortBy,
    max,
    defaultTo,
    uniq,
    flatten,
} from "grapher/utils/Util"
import { StackedBarValue, StackedBarSeries } from "./StackedBarChart"
import { ChartTransform } from "grapher/chart/ChartTransform"
import { EntityDimensionKey, Time } from "grapher/core/GrapherConstants"
import { ColorScale } from "grapher/color/ColorScale"

// Responsible for translating chart configuration into the form
// of a discrete bar chart
export class StackedBarTransform extends ChartTransform {
    @computed get failMessage() {
        const { filledDimensions } = this.grapher
        if (!filledDimensions.some((d) => d.property === "y"))
            return "Missing variable"
        else if (
            this.groupedData.length === 0 ||
            this.groupedData[0].values.length === 0
        )
            return "No matching data"
        else return undefined
    }

    @computed get primaryDimension() {
        return this.grapher.filledDimensions.find((d) => d.property === "y")
    }
    @computed get colorDimension() {
        return this.grapher.filledDimensions.find((d) => d.property === "color")
    }

    @computed get availableTimes(): Time[] {
        if (this.primaryDimension === undefined) return []
        return this.primaryDimension.timesUniq
    }

    @computed get barValueFormat(): (datum: StackedBarValue) => string {
        return (datum: StackedBarValue) => datum.y.toString()
    }

    @computed get tickFormatFn(): (d: number) => string {
        const { primaryDimension } = this
        return primaryDimension
            ? primaryDimension.formatValueShortFn
            : (d: number) => `${d}`
    }

    @computed get yFormatTooltipFn(): (d: number) => string {
        const { primaryDimension, yTickFormatFn } = this

        return primaryDimension
            ? primaryDimension.formatValueLongFn
            : yTickFormatFn
    }

    @computed get xDomainDefault(): [number, number] {
        return [this.startTimelineTime, this.endTimelineTime]
    }

    // TODO: Make XAxis generic
    @computed get xAxis() {
        const { grapher, xDomainDefault } = this
        const axis = grapher.xAxis.toHorizontalAxis()
        axis.updateDomainPreservingUserSettings(xDomainDefault)
        axis.tickFormatFn = this.grapher.table.timeColumnFormatFunction
        axis.hideGridlines = true
        axis.hideFractionalTicks = true
        return axis
    }

    @computed get yDomainDefault(): [number, number] {
        const lastSeries = this.stackedData[this.stackedData.length - 1]

        const yValues = lastSeries.values.map((d) => d.yOffset + d.y)
        return [0, defaultTo(max(yValues), 100)]
    }

    @computed get yDimensionFirst() {
        return this.grapher.filledDimensions.find((d) => d.property === "y")
    }

    @computed get yTickFormatFn() {
        const { yDimensionFirst } = this

        return yDimensionFirst ? yDimensionFirst.formatValueShortFn : identity
    }

    @computed get yAxis() {
        const { grapher, yDomainDefault, yTickFormatFn } = this
        const axis = grapher.yAxis.toVerticalAxis()
        axis.updateDomainPreservingUserSettings(yDomainDefault)
        axis.domain = [yDomainDefault[0], yDomainDefault[1]] // Stacked chart must have its own y domain
        axis.tickFormatFn = yTickFormatFn
        return axis
    }

    @computed get allStackedValues() {
        return flatten(this.stackedData.map((series) => series.values))
    }

    @computed get xValues() {
        return uniq(this.allStackedValues.map((bar) => bar.x))
    }

    @computed get groupedData() {
        const { grapher, timelineTimes } = this
        const { selectedKeys, selectedKeysByKey } = grapher
        const filledDimensions = grapher.filledDimensions

        let groupedData: StackedBarSeries[] = []

        filledDimensions.forEach((dimension, dimIndex) => {
            const seriesByKey = new Map<EntityDimensionKey, StackedBarSeries>()

            for (let i = 0; i <= dimension.times.length; i += 1) {
                const year = dimension.times[i]
                const entityName = dimension.entityNames[i]
                const value = +dimension.values[i]
                const entityDimensionKey = grapher.makeEntityDimensionKey(
                    entityName,
                    dimIndex
                )
                let series = seriesByKey.get(entityDimensionKey)

                // Not a selected key, don't add any data for it
                if (!selectedKeysByKey[entityDimensionKey]) continue
                // Must be numeric
                if (isNaN(value)) continue
                // Stacked bar chart can't go negative!
                if (value < 0) continue
                // only consider years that are part of timeline to line up the bars
                if (!timelineTimes.includes(year)) continue

                if (!series) {
                    series = {
                        entityDimensionKey: entityDimensionKey,
                        label: grapher.getLabelForKey(entityDimensionKey),
                        values: [],
                        color: "#fff", // Temp
                    }
                    seriesByKey.set(entityDimensionKey, series)
                }
                series.values.push({
                    x: year,
                    y: value,
                    yOffset: 0,
                    isFake: false,
                    label: series.label,
                })
            }

            groupedData = groupedData.concat([
                ...Array.from(seriesByKey.values()),
            ])
        })

        // Now ensure that every series has a value entry for every year in the data
        groupedData.forEach((series) => {
            let i = 0

            while (i < timelineTimes.length) {
                const value = series.values[i] as StackedBarValue | undefined
                const expectedYear = timelineTimes[i]

                if (value === undefined || value.x > timelineTimes[i]) {
                    // console.log("series " + series.key + " needs fake bar for " + expectedYear)

                    const fakeY = 0
                    series.values.splice(i, 0, {
                        x: expectedYear,
                        y: fakeY,
                        yOffset: 0,
                        isFake: true,
                        label: series.label,
                    })
                }
                i += 1
            }
        })

        // Preserve order
        groupedData = sortBy(
            groupedData,
            (series) => -selectedKeys.indexOf(series.entityDimensionKey)
        )

        return groupedData
    }

    @computed get colorScale() {
        const that = this
        return new ColorScale({
            get config() {
                return that.grapher.colorScale
            },
            get defaultBaseColorScheme() {
                return "stackedAreaDefault"
            },
            get sortedNumericValues() {
                return that.colorDimension?.sortedNumericValues ?? []
            },
            get categoricalValues() {
                return uniq(
                    that.groupedData.map((d) => d.entityDimensionKey)
                ).reverse()
            },
            get hasNoDataBin() {
                return false
            },
            get formatNumericValueFn() {
                return that.colorDimension?.formatValueShortFn ?? identity
            },
            get formatCategoricalValueFn() {
                return (key: EntityDimensionKey) =>
                    that.grapher.getLabelForKey(key)
            },
        })
    }

    // Apply time filtering and stacking
    @computed get stackedData() {
        const { groupedData, startTimelineTime, endTimelineTime } = this

        const stackedData = cloneDeep(groupedData)

        for (const series of stackedData) {
            series.color =
                this.colorScale.getColor(series.entityDimensionKey) ?? "#ddd"
            series.values = series.values.filter(
                (v) => v.x >= startTimelineTime && v.x <= endTimelineTime
            )
        }

        // every subsequent series needs be stacked on top of previous series
        for (let i = 1; i < stackedData.length; i++) {
            for (let j = 0; j < stackedData[0].values.length; j++) {
                stackedData[i].values[j].yOffset =
                    stackedData[i - 1].values[j].y +
                    stackedData[i - 1].values[j].yOffset
            }
        }

        // if the total height of any stacked column is 0, remove it
        const keyIndicesToRemove: number[] = []
        const lastSeries = stackedData[stackedData.length - 1]
        lastSeries.values.forEach((bar, index) => {
            if (bar.yOffset + bar.y === 0) {
                keyIndicesToRemove.push(index)
            }
        })
        for (let i = keyIndicesToRemove.length - 1; i >= 0; i--) {
            stackedData.forEach((series) => {
                series.values.splice(keyIndicesToRemove[i], 1)
            })
        }

        return stackedData
    }
}
