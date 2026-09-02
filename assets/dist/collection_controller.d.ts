import { Controller } from '@hotwired/stimulus';
export default class CollectionController extends Controller<HTMLElement> {
    private static readonly scrollZoneRatio;
    private static readonly maximumScrollSpeed;
    static targets: string[];
    static values: {
        index: NumberConstructor;
        prototype: StringConstructor;
        prototypes: ObjectConstructor;
        positionField: StringConstructor;
        confirmDelete: StringConstructor;
    };
    readonly itemsTarget: HTMLElement;
    readonly emptyTarget: HTMLElement;
    indexValue: number;
    prototypeValue: string;
    prototypesValue: Record<string, string>;
    positionFieldValue: string;
    confirmDeleteValue: string;
    private scrollSpeed;
    private scrollAnimationFrame;
    connect(): void;
    disconnect(): void;
    add(event: Event): void;
    remove(event: Event): void;
    moveUp(event: Event): void;
    moveDown(event: Event): void;
    private prepareItem;
    private dragOver;
    private drop;
    private updateAutoScroll;
    private autoScroll;
    private stopAutoScroll;
    private itemForEvent;
    private items;
    private updateOrder;
}
