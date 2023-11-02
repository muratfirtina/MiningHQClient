import { Machine } from "./machine";

export class ListMachine{
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: Machine[];
}