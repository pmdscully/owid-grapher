import * as React from "react"
import "site/client/owid.scss"
import "grapher/core/grapher.scss"
import { DiscreteBarChart } from "./DiscreteBarChart"
import { basicGdpGrapher } from "grapher/test/samples"
import { Bounds } from "grapher/utils/Bounds"

export default {
    title: "DiscreteBarChart",
    component: DiscreteBarChart,
}

export const Default = () => {
    const grapher = basicGdpGrapher()
    const bounds = new Bounds(0, 0, 640, 480)

    return (
        <svg width={640} height={480}>
            <DiscreteBarChart grapher={grapher} bounds={bounds} />
        </svg>
    )
}
