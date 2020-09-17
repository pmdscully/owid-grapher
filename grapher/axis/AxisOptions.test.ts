#! /usr/bin/env yarn jest

import { AxisConfig } from "grapher/axis/AxisConfig"
import { ScaleType } from "grapher/core/GrapherConstants"

describe("basics", () => {
    it("can create an axis, clone and modify the clone without affecting the original", () => {
        const axis = new AxisConfig({ scaleType: ScaleType.linear })
        expect(axis.scaleType).toEqual(ScaleType.linear)

        const clone = axis.toVerticalAxis()
        clone.scaleType = ScaleType.log
        expect(axis.scaleType).toEqual(ScaleType.linear)
        expect(clone.scaleType).toEqual(ScaleType.log)
    })

    it("can expand the domain beyond the user's settings and not shrink it", () => {
        const axis = new AxisConfig({
            min: 0,
            max: 100,
            scaleType: ScaleType.linear,
        })
        const clone = axis.toVerticalAxis()
        clone.updateDomainPreservingUserSettings([5, 50])
        expect(clone.domain).toEqual([0, 100])
        clone.updateDomainPreservingUserSettings([-5, 500])
        expect(clone.domain).toEqual([-5, 500])
    })
})
