#! /usr/bin/env yarn jest

import * as timezoneMock from "timezone-mock"

import {
    findClosestTime,
    getStartEndValues,
    formatDay,
    retryPromise,
    computeRollingAverage,
    insertMissingValuePlaceholders,
    rollingMap,
    groupMap,
    mergeQueryStr,
    next,
    previous,
    parseDelimited,
    toJsTable,
    intersectionOfSets,
    roundSigFig,
    getAvailableSlugSync,
    jsTableToDelimited,
    trimGrid,
    trimEmptyRows,
    JsTable,
    anyToString,
    sortNumeric,
    lowerCaseFirstLetterUnlessAbbreviation,
    trimObject,
} from "grapher/utils/Util"
import { strToQueryParams } from "utils/client/url"
import { SortOrder, ScaleType } from "grapher/core/GrapherConstants"

describe(findClosestTime, () => {
    describe("without tolerance", () => {
        describe("array", () => {
            it("returns the correct year", () => {
                const years = [2010, 2015, 2017]
                expect(findClosestTime(years, 2015, 0)).toEqual(2015)
            })
            it("returns undefined", () => {
                const years = [2010, 2015, 2017]
                expect(findClosestTime(years, 2014, 0)).toEqual(undefined)
            })
        })
    })

    describe("specified tolerance", () => {
        it("returns the closest year within the specified tolerance", () => {
            const years = [2010, 2015, 2017]
            expect(findClosestTime(years, 2013, 2)).toEqual(2015)
        })
        it("returns undefined outside the tolerance", () => {
            const years = [2010, 2017]
            expect(findClosestTime(years, 2014, 1)).toEqual(undefined)
        })
        it("prefers later years", () => {
            const years = [2010, 2012, 2013, 2017]
            expect(findClosestTime(years, 2011, 3)).toEqual(2012)
            expect(findClosestTime(years, 2015, 3)).toEqual(2017)
        })
    })

    describe("unspecified tolerance", () => {
        it("returns the closest year", () => {
            const years = [1990, 2016]
            expect(findClosestTime(years, 2013)).toEqual(2016)
            expect(findClosestTime(years, 2002)).toEqual(1990)
        })
    })
})

describe(getStartEndValues, () => {
    it("handles an empty array", () => {
        const extent = getStartEndValues([])
        expect(extent[0]).toEqual(undefined)
        expect(extent[1]).toEqual(undefined)
    })
    it("handles a single element array", () => {
        const extent = getStartEndValues([{ time: 2016, value: 1 }])
        expect(extent[0]!.time).toEqual(2016)
        expect(extent[1]!.time).toEqual(2016)
    })
    it("handles a multi-element array", () => {
        const extent = getStartEndValues([
            { time: 2016, value: -20 },
            { time: 2014, value: 5 },
            { time: 2017, value: 7 },
        ])
        expect(extent[0]!.time).toEqual(2014)
        expect(extent[1]!.time).toEqual(2017)
    })
})

describe(next, () => {
    const scenarios = [
        {
            list: [55, 33, 22],
            current: 33,
            next: 22,
            previous: 55,
        },
        {
            list: [55, 33, 22],
            current: 44,
            next: 55,
            previous: 22,
        },
        {
            list: [55, 33, 22],
            current: 22,
            next: 55,
            previous: 33,
        },
        {
            list: [55, 33, 22],
            current: 55,
            next: 33,
            previous: 22,
        },
        {
            list: [55],
            current: 55,
            next: 55,
            previous: 55,
        },
    ]
    it("iterates correctly", () => {
        scenarios.forEach((scenario) => {
            expect(next(scenario.list, scenario.current)).toBe(scenario.next)
            expect(previous(scenario.list, scenario.current)).toBe(
                scenario.previous
            )
        })
    })
})

describe(computeRollingAverage, () => {
    const testCases: {
        numbers: (number | undefined | null)[]
        window: number
        align: "center" | "right"
        result: (number | undefined | null)[]
    }[] = [
        // no smoothing
        {
            numbers: [2, 4, 6, 8],
            window: 1,
            align: "right",
            result: [2, 4, 6, 8],
        },
        {
            numbers: [1, -1, 1, -1],
            window: 2,
            align: "right",
            result: [1, 0, 0, 0],
        },
        {
            numbers: [1, undefined, null, -1, 1],
            window: 2,
            align: "right",
            result: [1, undefined, null, -1, 0],
        },
        {
            numbers: [1, 3, 5, 1],
            window: 3,
            align: "right",
            result: [1, 2, 3, 3],
        },
        {
            numbers: [0, 2, 4, 0],
            window: 3,
            align: "center",
            result: [1, 2, 2, 2],
        },
    ]
    it("computes the rolling average", () => {
        testCases.forEach((testCase) => {
            expect(
                computeRollingAverage(
                    testCase.numbers,
                    testCase.window,
                    testCase.align
                )
            ).toEqual(testCase.result)
        })
    })
})

describe(insertMissingValuePlaceholders, () => {
    const testCases = [
        {
            values: [2, -3, 10],
            years: [0, 2, 3],
            expected: [2, null, -3, 10],
        },
    ]
    it("computes the rolling average", () => {
        testCases.forEach((testCase) => {
            expect(
                insertMissingValuePlaceholders(testCase.values, testCase.years)
            ).toEqual(testCase.expected)
        })
    })

    const testCasesWithMissing = [
        {
            values: [0, 2, 3],
            years: [0, 2, 3],
            expected: [0, null, 2, 2.5],
        },
    ]

    it("computes the rolling average for data with missing values", () => {
        testCasesWithMissing.forEach((testCase) => {
            expect(
                computeRollingAverage(
                    insertMissingValuePlaceholders(
                        testCase.values,
                        testCase.years
                    ),
                    2
                )
            ).toEqual(testCase.expected)
        })
    })
})

describe(formatDay, () => {
    describe("timezones", () => {
        it("formats date consistently in GMT", () => {
            timezoneMock.register("Europe/London")
            expect(formatDay(0)).toEqual("Jan 21, 2020")
            timezoneMock.unregister()
        })

        it("formats date consistently in US/Pacific", () => {
            timezoneMock.register("US/Pacific")
            expect(formatDay(0)).toEqual("Jan 21, 2020")
            timezoneMock.unregister()
        })

        it("formats date consistently in US/Pacific", () => {
            timezoneMock.register("Australia/Adelaide")
            expect(formatDay(0)).toEqual("Jan 21, 2020")
            timezoneMock.unregister()
        })
    })

    describe("epoch", () => {
        it("starts on Jan 21, 2020", () => {
            expect(formatDay(0)).toEqual("Jan 21, 2020")
        })

        it("handles increments", () => {
            expect(formatDay(11)).toEqual("Feb 1, 2020")
        })

        it("handles decrements", () => {
            expect(formatDay(-21)).toEqual("Dec 31, 2019")
        })
    })
})

describe(retryPromise, () => {
    function resolveAfterNthRetry(nth: number, message: string = "success") {
        let retried = 0
        return () =>
            new Promise((resolve, reject) =>
                retried++ >= nth ? resolve(message) : reject()
            )
    }

    it("resolves when promise succeeds first-time", async () => {
        const promiseGetter = resolveAfterNthRetry(0, "success")
        expect(retryPromise(promiseGetter, 1)).resolves.toEqual("success")
    })

    it("resolves when promise succeeds before retry limit", async () => {
        const promiseGetter = resolveAfterNthRetry(2, "success")
        expect(retryPromise(promiseGetter, 3)).resolves.toEqual("success")
    })

    it("rejects when promise doesn't succeed within retry limit", async () => {
        const promiseGetter = resolveAfterNthRetry(3, "success")
        expect(retryPromise(promiseGetter, 3)).rejects.toBeUndefined()
    })
})

describe(rollingMap, () => {
    it("handles empty arrays", () => {
        expect(rollingMap([], () => undefined).length).toEqual(0)
    })
    it("handles arrays with 1 element", () => {
        expect(rollingMap([1], (a, b) => a + b).length).toEqual(0)
    })
    it("handles arrays with multiple elements", () => {
        expect(rollingMap([1, 2, 4, 8], (a, b) => b - a)).toEqual([1, 2, 4])
    })
})

describe(parseDelimited, () => {
    it("detects delimiter and parses delimited", () => {
        const str = `foo,bar
1,2`
        expect(parseDelimited(str)).toEqual(
            parseDelimited(str.replace(/,/g, "\t"))
        )
    })
})

describe(intersectionOfSets, () => {
    it("can detect set intersections", () => {
        const setA = new Set(["a", "b", "c"])
        const setB = new Set(["a", "b", "c", "d"])
        const setC = new Set(["a", "c", "d"])
        const setD = new Set(["a", "c", "d"])
        const setE = new Set([""])

        expect(
            Array.from(intersectionOfSets([setA, setB, setC, setD]).values())
        ).toEqual(["a", "c"])
        expect(
            Array.from(
                intersectionOfSets([setA, setB, setC, setD, setE]).values()
            )
        ).toEqual([])
        expect(intersectionOfSets([]).size).toEqual(new Set().size)
    })
})

describe("jsTables", () => {
    it("turns an arraw of objects into arrays", () => {
        const str = `gdp,pop
1,2`
        expect(toJsTable(parseDelimited(str))).toEqual([
            ["gdp", "pop"],
            ["1", "2"],
        ])

        expect(toJsTable(parseDelimited(""))).toEqual(undefined)

        expect(
            jsTableToDelimited(toJsTable(parseDelimited(str))!, ",")
        ).toEqual(str)
    })

    it("handles extra blank cells", () => {
        const table = toJsTable(
            parseDelimited(`gdp pop code    
123 345 usa    
`)
        )
        expect(jsTableToDelimited(trimGrid(table!) as JsTable, " "))
            .toEqual(`gdp pop code
123 345 usa`)
    })
})

describe("anyToString", () => {
    const values = [
        false,
        0,
        1,
        "0",
        "1",
        null,
        undefined,
        "false",
        "true",
        NaN,
        Infinity,
        {},
        0.1,
    ]
    const expected = [
        "false",
        "0",
        "1",
        "0",
        "1",
        "",
        "",
        "false",
        "true",
        "NaN",
        "Infinity",
        "[object Object]",
        "0.1",
    ]
    it("handles edge cases in format value", () => {
        expect(values.map(anyToString)).toEqual(expected)
    })
})

describe(trimObject, () => {
    it("trims an object", () => {
        expect(trimObject({ foo: undefined })).toEqual({})
        expect(trimObject({ foo: {} })).toEqual({})
        expect(trimObject({ foo: undefined, bar: 1 })).toEqual({ bar: 1 })
    })
})

describe(trimEmptyRows, () => {
    it("trims rows", () => {
        const testCases: { input: JsTable; length: number }[] = [
            {
                input: [["pop"], [123], [null], [""], [undefined]],
                length: 2,
            },
            {
                input: [[]],
                length: 0,
            },
            {
                input: [
                    ["pop", "gdp"],
                    [123, 345],
                    [undefined, 456],
                ],
                length: 3,
            },
        ]

        testCases.forEach((testCase) => {
            expect(trimEmptyRows(testCase.input).length).toEqual(
                testCase.length
            )
        })
    })
})

describe(groupMap, () => {
    it("groups by key", () => {
        const group = groupMap([0, 1, "a", 1, 1], (v) => v)
        expect(group.get(0)).toEqual([0])
        expect(group.get(1)).toEqual([1, 1, 1])
        expect(group.get("a")).toEqual(["a"])
    })
})

describe(mergeQueryStr, () => {
    it("chart params override explorer params", () => {
        const params = strToQueryParams(
            mergeQueryStr(
                "yScale=log&testsMetric=true&country=~GBR",
                "country=GBR~ESP"
            )
        )
        expect(params.yScale).toEqual(ScaleType.log)
        expect(params.country).toEqual("GBR~ESP")
    })

    it("handles undefined", () => {
        expect(mergeQueryStr(undefined, "")).toEqual("")
    })
})

describe(roundSigFig, () => {
    it("rounds to 1 sig fig by default", () => {
        expect(roundSigFig(652)).toEqual(700)
    })

    it("rounds integer to provided sig figs", () => {
        expect(roundSigFig(652, 2)).toEqual(650)
    })

    it("rounds floating point to provided sig figs", () => {
        expect(roundSigFig(0.00652, 1)).toEqual(0.007)
    })

    it("rounds negative values to provided sig figs", () => {
        expect(roundSigFig(-652, 1)).toEqual(-700)
    })

    it("leaves zero unchanged", () => {
        expect(roundSigFig(0, 2)).toEqual(0)
    })
})

describe(getAvailableSlugSync, () => {
    it("can generate a unique slug", () => {
        expect(getAvailableSlugSync("untitled", ["untitled"])).toEqual(
            "untitled-2"
        )
        expect(getAvailableSlugSync("new", ["untitled"])).toEqual("new")
    })
})

describe(lowerCaseFirstLetterUnlessAbbreviation, () => {
    it("works", () => {
        expect(lowerCaseFirstLetterUnlessAbbreviation("GDP")).toEqual("GDP")
        expect(lowerCaseFirstLetterUnlessAbbreviation("Change in")).toEqual(
            "change in"
        )
    })
})

describe(sortNumeric, () => {
    it("sorts numeric values", () => {
        expect(sortNumeric([3, 4, 2, 1, 3, 8])).toEqual([1, 2, 3, 3, 4, 8])
    })

    it("sorts numeric values in ascending value", () => {
        expect(
            sortNumeric([3, 4, 2, 1, 3, 8], undefined, SortOrder.asc)
        ).toEqual([1, 2, 3, 3, 4, 8])
    })

    it("sorts numeric values in descending order", () => {
        expect(
            sortNumeric([3, 4, 2, 1, 3, 8], undefined, SortOrder.desc)
        ).toEqual([8, 4, 3, 3, 2, 1])
    })

    it("sorts objects using a sortBy function", () => {
        expect(
            sortNumeric(
                [{ a: 3 }, { a: 4 }, { a: 2 }, { a: 1 }, { a: 3 }, { a: 8 }],
                (o) => o.a
            )
        ).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 3 }, { a: 4 }, { a: 8 }])
    })
})
