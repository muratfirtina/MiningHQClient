import { MachineType } from "./machine-type";

export class ListMachineType {
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: MachineType[];
}