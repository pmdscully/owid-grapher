import { observable } from "mobx"

import { Color } from "./Color"

export enum ColorScaleBinningStrategy {
    quantize = "quantize",
    // quantile = "quantile",
    // ckmeans = "ckmeans",
    manual = "manual"
}

export const colorScaleBinningStrategyLabels: Record<
    ColorScaleBinningStrategy,
    string
> = {
    quantize: "Equal-sized bins (quantize)",
    // quantile: "Quantiles",
    // ckmeans: "Ckmeans",
    manual: "Manual"
}

export class ColorScaleConfigProps {
    // Color scheme
    // ============

    /** Key for a colorbrewer scheme */
    @observable baseColorScheme?: string

    /** Reverse the order of colors in the color scheme (defined by `baseColorScheme`) */
    @observable colorSchemeInvert?: true = undefined

    // Numeric bins
    // ============

    /** The strategy for generating the bin boundaries */
    @observable binningStrategy: ColorScaleBinningStrategy =
        ColorScaleBinningStrategy.quantize

    // Iff the binningStrategy is `manual`, then overrides are specified below.
    // Otherwise, the overrides are ignored.

    /** The minimum bracket of the first bin */
    @observable customNumericMinValue?: number
    /** Custom maximum brackets for each numeric bin */
    @observable customNumericValues: number[] = []
    /** Custom labels for each numeric bin */
    @observable customNumericLabels: (string | undefined)[] = []

    /** Whether `customNumericColors` are used to override the color scheme. */
    @observable customNumericColorsActive?: true = undefined
    /**
     * Override some or all colors for the numerical color legend.
     * `undefined` uses the color scheme color.
     */
    @observable customNumericColors: (Color | undefined)[] = []

    /** Whether the visual scaling for the color legend is disabled. */
    @observable equalSizeBins?: true = undefined

    // Categorical bins
    // ================

    @observable.ref customCategoryColors: {
        [key: string]: string | undefined
    } = {}

    @observable.ref customCategoryLabels: {
        [key: string]: string | undefined
    } = {}

    // Allow hiding categories from the legend
    @observable.ref customHiddenCategories: {
        [key: string]: true | undefined
    } = {}

    // Other
    // =====

    @observable legendDescription?: string = undefined

    constructor(json?: Partial<ColorScaleConfigProps>) {
        if (json !== undefined) {
            for (const key in this) {
                if (key in json) {
                    this[key] = (json as any)[key]
                }
            }
        }
    }
}
