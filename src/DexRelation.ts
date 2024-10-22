import { HashMap } from "effect";
import { DexNode } from "./DexNode";

export namespace DexRelation {
    export interface DexRelation<T> {
        parent: T;
        child: T;
    }

    export function makeRelations<T extends DexNode.DexNode<T>>(root: T): DexRelation<T>[] {
        const relations: DexRelation<T>[] = [];
        for (const node of DexNode.traverse<T>(root)) {
            for (const child of node.children) {
                relations.push({ parent: node, child });
            }
        }
        return relations;
    }

    export function makeParentByChildMap<T>(relations: DexRelation<T>[]): HashMap.HashMap<T, T> {
        const entries: [T, T][] = relations.map(relation => [relation.child, relation.parent]);
        const map = HashMap.make(...entries);
        return map;
    }
}