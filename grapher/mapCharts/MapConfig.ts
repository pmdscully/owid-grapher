import { observable } from "mobx"
import { MapProjection } from "./MapProjections"
import { ColorScaleConfig } from "grapher/color/ColorScaleConfig"
import { ColumnSlug, LegacyVariableId } from "owidTable/OwidTableConstants"
import {
    Persistable,
    updatePersistables,
    objectWithPersistablesToObject,
    deleteRuntimeAndUnchangedProps,
} from "grapher/persistable/Persistable"
import { maxTimeFromJSON, maxTimeToJSON } from "grapher/utils/TimeBounds"

// MapConfig holds the data and underlying logic needed by MapTab.
// It wraps the map property on ChartConfig.
// TODO: migrate database config & only pass legend props
class MapConfigDefaults {
    @observable columnSlug?: ColumnSlug
    @observable time?: number
    @observable timeTolerance?: number
    @observable hideTimeline?: true
    @observable projection: MapProjection = "World"

    @observable colorScale = new ColorScaleConfig()
    // Show the label from colorSchemeLabels in the tooltip instead of the numeric value
    @observable tooltipUseCustomLabels?: true = undefined
}

export type MapConfigInterface = MapConfigDefaults

interface MapConfigWithLegacyInterface extends MapConfigInterface {
    variableId?: LegacyVariableId
    year?: number
}

export class MapConfig extends MapConfigDefaults implements Persistable {
    updateFromObject(obj: Partial<MapConfigWithLegacyInterface>) {
        // Migrate variableIds to columnSlugs
        if (obj.variableId && !obj.columnSlug)
            obj.columnSlug = obj.variableId.toString()

        // Migrate "targetYear" to "time"
        if (obj.year) this.time = maxTimeFromJSON(obj.year)

        updatePersistables(this, obj)
    }

    toObject() {
        const obj = objectWithPersistablesToObject(
            this
        ) as MapConfigWithLegacyInterface
        deleteRuntimeAndUnchangedProps(obj, new MapConfigDefaults())

        if (obj.time) obj.time = maxTimeToJSON(this.time) as any

        if (obj.columnSlug) {
            // Restore variableId for legacy for now
            obj.variableId = parseInt(obj.columnSlug)
            delete obj.columnSlug
        }

        return obj
    }

    constructor(obj?: Partial<MapConfigWithLegacyInterface>) {
        super()
        if (obj) this.updateFromObject(obj)
    }
}
