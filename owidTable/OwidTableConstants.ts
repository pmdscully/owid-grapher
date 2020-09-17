export declare type Integer = number
export declare type Year = Integer
export declare type EntityName = string
export declare type EntityCode = string
export declare type EntityId = number
export declare type LegacyVariableId = Integer
export declare type ColumnSlug = string // let's be very restrictive on valid column names to start.

export interface OwidSource {
    id: number
    name: string
    dataPublishedBy: string
    dataPublisherSource: string
    link: string
    retrievedDate: string
    additionalInfo: string
}

export enum ColumnTypeNames {
    Numeric = "Numeric",
    String = "String",
    Categorical = "Categorical",
    Boolean = "Boolean",
    Currency = "Currency",
    Percentage = "Percentage",
    DecimalPercentage = "DecimalPercentage",
    Integer = "Integer",
    Population = "Population",
    PopulationDensity = "PopulationDensity",
    Age = "Age",
    Ratio = "Ratio",
    Year = "Year",
    Date = "Date",
}
