import {
    BlockType,
    Block,
    LoopStartBlock,
    Routine
} from "./types";

import { preprocess, parseLines } from "./lexer";

export function inesertAfter(prog: Routine, block: Block, afterType: BlockType): Routine {
    let blocks: Block[] = prog.blocks
        .map((b: Block) => (b.type === afterType) ? [b, block] : [b])
        .flat();
    prog.blocks = blocks;
    return prog;
}

export function inesertBefore(prog: Routine, block: Block, beforeType: BlockType): Routine {
    let blocks: Block[] = prog.blocks
        .map((b: Block) => (b.type === beforeType) ? [block, b] : [b])
        .flat();
    prog.blocks = blocks;
    return prog;
}

export function insertCustomGcodeBefore(prog: Routine, code: string, t: BlockType): Routine {
    let customBlock = new LoopStartBlock(parseLines(preprocess(code)));
    if (code)
        prog = inesertBefore(prog, customBlock, t);
    return prog;
}

export function insertCustomGcodeAfter(prog: Routine, code: string, t: BlockType): Routine {
    let customBlock = new LoopStartBlock(parseLines(preprocess(code)));
    if (code)
        prog = inesertAfter(prog, customBlock, t);
    return prog;
}

export function ceilOffTo(num: number, factor = 1): number {
    const quotient = num / factor;
    const res = Math.ceil(quotient) * factor;
    return res;
};

export function zeroPad(num: number, places: number): string {
    return String(num).padStart(places, '0');
}
