export interface GetTimekeepingListResponse<T> {
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    items: T[];
    }