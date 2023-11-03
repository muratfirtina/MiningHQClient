import { Model } from "./model";

export class ListModel{
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: Model[];
}