import * as React from "react"
import { observable, computed, action } from "mobx"
import { observer } from "mobx-react"
import { ChartDimension } from "grapher/chart/ChartDimension"
import { ChartEditor } from "./ChartEditor"
import {
    Toggle,
    EditableListItem,
    BindAutoString,
    BindAutoFloat,
} from "./Forms"
import { Link } from "./Link"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown"
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp"
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons/faExchangeAlt"
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

@observer
export class DimensionCard extends React.Component<{
    dimension: ChartDimension
    editor: ChartEditor
    onEdit?: () => void
    onRemove?: () => void
}> {
    @observable.ref isExpanded: boolean = false

    @computed get hasExpandedOptions(): boolean {
        return (
            this.props.dimension.property === "y" ||
            this.props.dimension.property === "x" ||
            this.props.dimension.property === "color"
        )
    }

    @action.bound onToggleExpand() {
        this.isExpanded = !this.isExpanded
    }

    @action.bound onIsProjection(value: boolean) {
        this.props.dimension.display.isProjection = value
    }

    private get tableDisplaySettings() {
        const { tableDisplay } = this.props.dimension.display
        if (!tableDisplay) return
        return (
            <React.Fragment>
                <hr className="ui divider" />
                Table:
                <Toggle
                    label="Hide absolute change column"
                    value={tableDisplay.hideAbsoluteChange}
                    onValue={(value) =>
                        (tableDisplay.hideAbsoluteChange = value)
                    }
                />
                <Toggle
                    label="Hide relative change column"
                    value={tableDisplay.hideRelativeChange}
                    onValue={(value) =>
                        (tableDisplay.hideRelativeChange = value)
                    }
                />
                <hr className="ui divider" />
            </React.Fragment>
        )
    }

    render() {
        const { dimension, editor } = this.props
        const { grapher } = editor

        return (
            <EditableListItem className="DimensionCard">
                <header>
                    <div>
                        {this.hasExpandedOptions && (
                            <span
                                className="clickable"
                                onClick={this.onToggleExpand}
                            >
                                <FontAwesomeIcon
                                    icon={
                                        this.isExpanded
                                            ? faChevronUp
                                            : faChevronDown
                                    }
                                />
                            </span>
                        )}
                    </div>
                    <div>
                        <Link
                            to={`/variables/${dimension.variableId}`}
                            className="dimensionLink"
                            target="_blank"
                        >
                            {dimension.column.name}
                        </Link>
                    </div>
                    <div>
                        {this.props.onEdit && (
                            <div
                                className="clickable"
                                onClick={this.props.onEdit}
                            >
                                <FontAwesomeIcon icon={faExchangeAlt} />
                            </div>
                        )}
                        {this.props.onRemove && (
                            <div
                                className="clickable"
                                onClick={this.props.onRemove}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </div>
                        )}
                    </div>
                </header>
                {this.isExpanded && (
                    <div>
                        <BindAutoString
                            label="Display name"
                            field="name"
                            store={dimension.display}
                            auto={dimension.displayName}
                        />
                        <BindAutoString
                            label="Unit of measurement"
                            field="unit"
                            store={dimension.display}
                            auto={dimension.unit}
                            helpText={`Original database unit: ${dimension.column.unit}`}
                        />
                        <BindAutoString
                            label="Short (axis) unit"
                            field="shortUnit"
                            store={dimension.display}
                            auto={dimension.shortUnit}
                        />
                        <BindAutoFloat
                            label="Number of decimal places"
                            field="numDecimalPlaces"
                            store={dimension.display}
                            auto={dimension.numDecimalPlaces}
                            helpText={`A negative number here will round integers`}
                        />
                        <BindAutoFloat
                            label="Unit conversion factor"
                            field="conversionFactor"
                            store={dimension.display}
                            auto={dimension.unitConversionFactor}
                            helpText={`Multiply all values by this amount`}
                        />
                        {this.tableDisplaySettings}
                        {(grapher.isScatter ||
                            grapher.isDiscreteBar ||
                            grapher.isLineChart) && (
                            <BindAutoFloat
                                field="tolerance"
                                store={dimension.display}
                                auto={dimension.tolerance}
                            />
                        )}
                        {grapher.isLineChart && (
                            <Toggle
                                label="Is projection"
                                value={dimension.isProjection}
                                onValue={this.onIsProjection}
                            />
                        )}
                        <hr className="ui divider" />
                    </div>
                )}
            </EditableListItem>
        )
    }
}
