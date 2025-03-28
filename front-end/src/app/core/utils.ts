import { Observable, Observer, Subscriber } from 'rxjs';
import { Point, Values } from './types/processing';

export function observeResizes(
    target: Element,
): Observable<ResizeObserverEntry> {
    return new Observable(
        (subscriber: Subscriber<ResizeObserverEntry>): (() => void) => {
            const resizeObserver = new ResizeObserver(
                (entries: ResizeObserverEntry[]): void => {
                    entries.forEach((entry: ResizeObserverEntry): void => {
                        subscriber.next(entry);
                    });
                },
            );

            resizeObserver.observe(target);

            return (): void => {
                resizeObserver.unobserve(target);
                resizeObserver.disconnect();
            };
        },
    );
}

export type CytoscapeEventHandlerFnParams = [
    event: cytoscape.EventObject,
    ...extraParams: any,
];

export function fromCytoscapeObjEvent(
    cytoscapeObj: cytoscape.Core,
    event: string,
    selector?: cytoscape.Selector,
): Observable<CytoscapeEventHandlerFnParams> {
    return new Observable(
        (observer: Observer<CytoscapeEventHandlerFnParams>): void => {
            if (selector) {
                cytoscapeObj.on(
                    event,
                    selector,
                    (...args: CytoscapeEventHandlerFnParams): void => {
                        observer.next(args);
                    },
                );

                return;
            }
            cytoscapeObj.on(
                event,
                (...args: CytoscapeEventHandlerFnParams): void => {
                    observer.next(args);
                },
            );
        },
    );
}

export function areEqual<Value>(valueA: Value, valueB: Value): boolean {
    return JSON.stringify(valueA) === JSON.stringify(valueB);
}

export function valuesToRowData(values: Values[]): Record<string, number>[] {
    if (!values.length) {
        return [];
    }

    const times: number[] = getSetArray(
        values.reduce(
            (times: number[], value: Values): number[] =>
                times.concat(value.values.map((point): number => point.time)),
            [],
        ),
    );

    times.sort((timeA: number, timeB: number): number => timeA - timeB);

    return times.reduce(
        (
            rowsData: Record<string, number>[],
            time: number,
        ): Record<string, number>[] =>
            rowsData.concat(
                values.reduce(
                    (
                        row: Record<string, number>,
                        value: Values,
                    ): Record<string, number> => {
                        const point: Point | undefined = value.values.find(
                            (point: Point): boolean => point.time === time,
                        );

                        if (point) {
                            row[value.name] = point.value;
                        }

                        return row;
                    },
                    {
                        t: time,
                    },
                ),
            ),
        [],
    );
}

export function rowDataToValues(rowData: Record<string, number>[]): Values[] {
    if (!rowData.length) {
        return [];
    }

    const columns: string[] = getSetArray(
        rowData.reduce(
            (columns: string[], row: Record<string, number>): string[] =>
                columns.concat(
                    Object.keys(row).filter(
                        (name: string): boolean => name !== 't',
                    ),
                ),
            [],
        ),
    );

    return columns.reduce((values: Values[], name: string): Values[] => {
        const currentValues: Point[] = rowData.reduce(
            (currentValues: Point[], row: Record<string, number>): Point[] => {
                if (!row.hasOwnProperty(name)) {
                    return currentValues;
                }

                return currentValues.concat({
                    time: row['t'],
                    value: row[name],
                });
            },
            [],
        );

        if (currentValues.length) {
            currentValues.sort(
                (pointA: Point, pointB: Point): number =>
                    pointA.time - pointB.time,
            );

            values.push({
                name,
                values: currentValues,
            });
        }

        return values;
    }, []);
}

export function getSetArray<Type>(array: Type[]): Type[] {
    return Array.from(new Set(array));
}

export interface Diff<Type extends { id: string }> {
    added: Type[];
    updated: Type[];
    removed: Type[];
}

export function getDiff<Type extends { id: string }>(
    oldArray: Type[],
    newArray: Type[],
): Diff<Type> {
    const diff: Diff<Type> = {
        added: [],
        updated: [],
        removed: [],
    };

    newArray.forEach((newItem: Type): void => {
        if (
            oldArray.find((oldItem: Type): boolean => oldItem.id === newItem.id)
        ) {
            diff.updated.push(newItem);

            return;
        }

        diff.added.push(newItem);
    });

    diff.removed.push(
        ...oldArray.filter(
            (oldItem: Type): boolean =>
                !newArray.find(
                    (newItem: Type): boolean => newItem.id === oldItem.id,
                ),
        ),
    );

    return diff;
}
