import { Employee } from "./employee";
import { SingleEmployee } from "./single-employee";

export class ListEmployee {
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: SingleEmployee[];
    
}
