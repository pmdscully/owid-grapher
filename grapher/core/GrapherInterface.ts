import {
    ChartTypeName,
    StackMode,
    GrapherTabOption,
    ScatterPointLabelStrategy,
    HighlightToggleConfig,
    RelatedQuestionsConfig,
    AddCountryMode,
    EntitySelection,
    Time,
} from "./GrapherConstants"
import { AxisConfigInterface } from "grapher/axis/AxisConfig"
import { LegacyVariablesAndEntityKey } from "owidTable/LegacyVariableCode"
import { TimeBound } from "grapher/utils/TimeBounds"
import { ChartDimensionInterface } from "grapher/chart/ChartDimension"
import { ComparisonLineConfig } from "grapher/scatterCharts/ComparisonLine"
import { LogoOption } from "grapher/chart/Logos"
import { ColorScaleConfigInterface } from "grapher/color/ColorScaleConfig"
import { MapConfigInterface } from "grapher/mapCharts/MapConfig"

// This configuration represents the entire persistent state of a grapher
// Ideally, this is also all of the interaction state: when a grapher is saved and loaded again
// under the same rendering conditions it ought to remain visually identical
export interface GrapherInterface {
    type?: ChartTypeName
    isExplorable?: boolean
    id?: number
    version?: number
    slug?: string
    title?: string
    subtitle?: string
    sourceDesc?: string
    note?: string
    hideTitleAnnotation?: true
    externalDataUrl?: string
    owidDataset?: LegacyVariablesAndEntityKey
    manuallyProvideData?: boolean
    selectedData?: EntitySelection[]
    minTime?: TimeBound
    maxTime?: TimeBound
    timelineMinTime?: Time
    timelineMaxTime?: Time
    dimensions?: ChartDimensionInterface[]
    addCountryMode?: AddCountryMode
    comparisonLines?: ComparisonLineConfig[]
    highlightToggle?: HighlightToggleConfig
    stackMode?: StackMode
    hideLegend?: true
    logo?: LogoOption
    hideLogo?: boolean
    hideRelativeToggle?: boolean
    entityType?: string
    entityTypePlural?: string
    hideTimeline?: true
    zoomToSelection?: true
    minPopulationFilter?: number
    showYearLabels?: boolean // Always show year in labels for bar charts
    hasChartTab?: boolean
    hasMapTab?: boolean
    tab?: GrapherTabOption
    overlay?: GrapherTabOption
    relatedQuestions?: RelatedQuestionsConfig[]
    internalNotes?: string
    variantName?: string
    originUrl?: string
    isPublished?: true
    baseColorScheme?: string
    invertColorScheme?: true
    hideLinesOutsideTolerance?: true
    hideConnectedScatterLines?: boolean // Hides lines between points when timeline spans multiple years. Requested by core-econ for certain charts
    scatterPointLabelStrategy?: ScatterPointLabelStrategy
    compareEndPointsOnly?: true
    matchingEntitiesOnly?: true
    excludedEntities?: number[]

    xAxis?: Partial<AxisConfigInterface>
    yAxis?: Partial<AxisConfigInterface>
    colorScale?: Partial<ColorScaleConfigInterface>
    map?: Partial<MapConfigInterface>
}
