#! /usr/bin/env yarn jest

import { GrapherInterface } from "grapher/core/GrapherInterface"
import { TimeBoundValue, TimeBound, TimeBounds } from "grapher/utils/TimeBounds"
import {
    GrapherUrl,
    LegacyGrapherQueryParams,
    legacyQueryParamsToCurrentQueryParams,
} from "./GrapherUrl"
import { Grapher } from "grapher/core/Grapher"
import { ScaleType } from "./GrapherConstants"

const getGrapher = () =>
    new Grapher({
        dimensions: [
            {
                variableId: 142609,
                property: "y",
            },
        ],
        owidDataset: {
            variables: {
                "142708": {
                    years: [-1, 0, 1, 2],
                    entities: [1, 2, 1, 2],
                    values: [51, 52, 53, 54],
                    id: 142708,
                    display: { zeroDay: "2020-01-21", yearIsDay: true },
                },
            },
            entityKey: {
                "1": { name: "United Kingdom", code: "GBR", id: 1 },
                "2": { name: "Ireland", code: "IRL", id: 2 },
            },
        },
    })

function fromQueryParams(
    params: LegacyGrapherQueryParams,
    props?: Partial<GrapherInterface>
) {
    const grapher = new Grapher(props)
    grapher.populateFromQueryParams(
        legacyQueryParamsToCurrentQueryParams(params)
    )
    return grapher
}

function toQueryParams(props?: Partial<GrapherInterface>) {
    const grapher = new Grapher({
        minTime: -5000,
        maxTime: 5000,
        map: { time: 5000 },
    })
    if (props) grapher.updateFromObject(props)
    return grapher.url.params
}

describe("legacy urls", () => {
    it("can upgrade legacy urls", () => {
        expect(
            legacyQueryParamsToCurrentQueryParams({ year: "2000" })
        ).toEqual({ time: "2000" })

        // Do not override time if set
        expect(
            legacyQueryParamsToCurrentQueryParams({
                year: "2000",
                time: "2001..2002",
            })
        ).toEqual({ time: "2001..2002" })
    })
})

describe(GrapherUrl, () => {
    describe("scaleType", () => {
        expect(new Grapher().url.params.xScale).toEqual(undefined)
        expect(
            new Grapher({
                xAxis: { scaleType: ScaleType.linear },
            } as GrapherInterface).url.params.xScale
        ).toEqual(undefined)
    })

    describe("base url", () => {
        const url = new GrapherUrl(
            new Grapher({ isPublished: true, slug: "foo" })
        )
        expect(url.baseUrl).toEqual("/grapher/foo")
    })

    describe("if a user sets a query param but dropUnchangedParams is false, do not delete the param even if it is a default", () => {
        const grapher = new Grapher(
            {
                xAxis: {
                    scaleType: ScaleType.linear,
                    canChangeScaleType: true,
                },
            },
            { queryStr: "scaleType=linear" }
        )
        expect(grapher.url.params.xScale).toEqual(undefined)
        grapher.url.dropUnchangedParams = false
        expect(grapher.url.params.xScale).toEqual(ScaleType.linear)
    })

    describe("time parameter", () => {
        describe("with years", () => {
            const tests: {
                name: string
                query: string
                param: TimeBounds
                irreversible?: boolean
            }[] = [
                { name: "single year", query: "1500", param: [1500, 1500] },
                {
                    name: "single year negative",
                    query: "-1500",
                    param: [-1500, -1500],
                },
                { name: "single year zero", query: "0", param: [0, 0] },
                {
                    name: "single year latest",
                    query: "latest",
                    param: [
                        TimeBoundValue.unboundedRight,
                        TimeBoundValue.unboundedRight,
                    ],
                },
                {
                    name: "single year earliest",
                    query: "earliest",
                    param: [
                        TimeBoundValue.unboundedLeft,
                        TimeBoundValue.unboundedLeft,
                    ],
                },
                { name: "two years", query: "2000..2005", param: [2000, 2005] },
                {
                    name: "negative years",
                    query: "-500..-1",
                    param: [-500, -1],
                },
                {
                    name: "right unbounded",
                    query: "2000..latest",
                    param: [2000, TimeBoundValue.unboundedRight],
                },
                {
                    name: "left unbounded",
                    query: "earliest..2005",
                    param: [TimeBoundValue.unboundedLeft, 2005],
                },
                {
                    name: "left unbounded",
                    query: "earliest..latest",
                    param: [
                        TimeBoundValue.unboundedLeft,
                        TimeBoundValue.unboundedRight,
                    ],
                },

                // The queries below can be considered legacy and are no longer generated this way,
                // but we still want to support existing URLs of this form
                {
                    name: "right unbounded [legacy]",
                    query: "2000..",
                    param: [2000, TimeBoundValue.unboundedRight],
                    irreversible: true,
                },
                {
                    name: "left unbounded [legacy]",
                    query: "..2005",
                    param: [TimeBoundValue.unboundedLeft, 2005],
                    irreversible: true,
                },
                {
                    name: "both unbounded [legacy]",
                    query: "..",
                    param: [
                        TimeBoundValue.unboundedLeft,
                        TimeBoundValue.unboundedRight,
                    ],
                    irreversible: true,
                },
            ]

            for (const test of tests) {
                it(`parse ${test.name}`, () => {
                    const grapher = fromQueryParams({ time: test.query })
                    const [start, end] = grapher.timeDomain
                    expect(start).toEqual(test.param[0])
                    expect(end).toEqual(test.param[1])
                })
                if (!test.irreversible) {
                    it(`encode ${test.name}`, () => {
                        const params = toQueryParams({
                            minTime: test.param[0],
                            maxTime: test.param[1],
                        })
                        expect(params.time).toEqual(test.query)
                    })
                }
            }

            it("empty string doesn't change time", () => {
                const grapher = fromQueryParams(
                    { time: "" },
                    { minTime: 0, maxTime: 5 }
                )
                const [start, end] = grapher.timeDomain
                expect(start).toEqual(0)
                expect(end).toEqual(5)
            })

            it("doesn't include URL param if it's identical to original config", () => {
                const grapher = new Grapher({
                    minTime: 0,
                    maxTime: 75,
                })
                expect(grapher.url.params.time).toEqual(undefined)
            })

            it("doesn't include URL param if unbounded is encoded as `undefined`", () => {
                const grapher = new Grapher({
                    minTime: undefined,
                    maxTime: 75,
                })
                expect(grapher.url.params.time).toEqual(undefined)
            })
        })

        describe("with days", () => {
            const tests: {
                name: string
                query: string
                param: TimeBounds
                irreversible?: boolean
            }[] = [
                {
                    name: "single day (date)",
                    query: "2020-01-22",
                    param: [1, 1],
                },
                {
                    name: "single day negative (date)",
                    query: "2020-01-01",
                    param: [-20, -20],
                },
                {
                    name: "single day zero (date)",
                    query: "2020-01-21",
                    param: [0, 0],
                },
                {
                    name: "single day latest",
                    query: "latest",
                    param: [
                        TimeBoundValue.unboundedRight,
                        TimeBoundValue.unboundedRight,
                    ],
                },
                {
                    name: "single day earliest",
                    query: "earliest",
                    param: [
                        TimeBoundValue.unboundedLeft,
                        TimeBoundValue.unboundedLeft,
                    ],
                },
                {
                    name: "two days",
                    query: "2020-01-01..2020-02-01",
                    param: [-20, 11],
                },
                {
                    name: "left unbounded (date)",
                    query: "earliest..2020-02-01",
                    param: [TimeBoundValue.unboundedLeft, 11],
                },
                {
                    name: "right unbounded (date)",
                    query: "2020-01-01..latest",
                    param: [-20, TimeBoundValue.unboundedRight],
                },
                {
                    name: "both unbounded (date)",
                    query: "earliest..latest",
                    param: [
                        TimeBoundValue.unboundedLeft,
                        TimeBoundValue.unboundedRight,
                    ],
                },

                // The queries below can be considered legacy and are no longer generated this way,
                // but we still want to support existing URLs of this form
                {
                    name: "right unbounded (date) [legacy]",
                    query: "2020-01-01..",
                    param: [-20, TimeBoundValue.unboundedRight],
                    irreversible: true,
                },
                {
                    name: "left unbounded (date) [legacy]",
                    query: "..2020-01-01",
                    param: [TimeBoundValue.unboundedLeft, -20],
                    irreversible: true,
                },
                {
                    name: "both unbounded [legacy]",
                    query: "..",
                    param: [
                        TimeBoundValue.unboundedLeft,
                        TimeBoundValue.unboundedRight,
                    ],
                    irreversible: true,
                },

                {
                    name: "single day (number)",
                    query: "5",
                    param: [5, 5],
                    irreversible: true,
                },
                {
                    name: "range (number)",
                    query: "-5..5",
                    param: [-5, 5],
                    irreversible: true,
                },
                {
                    name: "unbounded range (number)",
                    query: "-500..",
                    param: [-500, TimeBoundValue.unboundedRight],
                    irreversible: true,
                },
            ]

            for (const test of tests) {
                it(`parse ${test.name}`, () => {
                    const grapher = getGrapher()
                    grapher.populateFromQueryParams({ time: test.query })
                    const [start, end] = grapher.timeDomain
                    expect(start).toEqual(test.param[0])
                    expect(end).toEqual(test.param[1])
                })
                if (!test.irreversible) {
                    it(`encode ${test.name}`, () => {
                        const grapher = getGrapher()
                        grapher.updateFromObject({
                            minTime: test.param[0],
                            maxTime: test.param[1],
                        })
                        const params = grapher.url.params
                        expect(params.time).toEqual(test.query)
                    })
                }
            }
        })
    })

    describe("year parameter", () => {
        describe("with years", () => {
            const tests: {
                name: string
                query: string
                param: TimeBound
            }[] = [
                { name: "single year", query: "1500", param: 1500 },
                {
                    name: "single year negative",
                    query: "-1500",
                    param: -1500,
                },
                { name: "single year zero", query: "0", param: 0 },
                {
                    name: "single year latest",
                    query: "latest",
                    param: TimeBoundValue.unboundedRight,
                },
                {
                    name: "single year earliest",
                    query: "earliest",
                    param: TimeBoundValue.unboundedLeft,
                },
            ]

            for (const test of tests) {
                it(`parse ${test.name}`, () => {
                    const grapher = fromQueryParams({ year: test.query })
                    expect(grapher.timeDomain[1]).toEqual(test.param)
                })
                it(`encode ${test.name}`, () => {
                    const params = toQueryParams({
                        map: { time: test.param },
                    })
                    expect(params.time).toEqual(test.query)
                })
            }

            it("empty string doesn't change time", () => {
                const grapher = fromQueryParams({ year: "", time: "2015" })
                expect(grapher.timeDomain[1]).toEqual(2015)
            })
        })

        describe("with days", () => {
            const tests: {
                name: string
                query: string
                param: TimeBound
                irreversible?: boolean
            }[] = [
                { name: "single day", query: "2020-01-30", param: 9 },
                {
                    name: "single day negative",
                    query: "2020-01-01",
                    param: -20,
                },
                { name: "single day zero", query: "2020-01-21", param: 0 },
                {
                    name: "single day latest",
                    query: "latest",
                    param: TimeBoundValue.unboundedRight,
                },
                {
                    name: "single day earliest",
                    query: "earliest",
                    param: TimeBoundValue.unboundedLeft,
                },
                {
                    name: "single day (number)",
                    query: "0",
                    param: 0,
                    irreversible: true,
                },
            ]

            for (const test of tests) {
                it(`parse ${test.name}`, () => {
                    const grapher = getGrapher()
                    grapher.populateFromQueryParams(
                        legacyQueryParamsToCurrentQueryParams({
                            year: test.query,
                        })
                    )
                    expect(grapher.timeDomain).toEqual([test.param, test.param])
                })
                if (!test.irreversible) {
                    it(`encode ${test.name}`, () => {
                        const grapher = getGrapher()
                        grapher.updateFromObject({
                            map: { time: test.param },
                        })
                        const params = grapher.url.params
                        expect(params.time).toEqual(test.query)
                    })
                }
            }
        })
    })
})
