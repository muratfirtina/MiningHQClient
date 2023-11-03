import { Quarry } from "./quarry";

export class ListQuarry {
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: Quarry[];
}