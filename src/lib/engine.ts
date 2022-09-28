import * as _ from 'lodash';

import {
    type Token,
    Line,
    BlockType,
    Block,
    BasicBlock,
    ToolchangeBlock,
    StartBlock,
    LoopStartBlock,
    LoopEndBlock,
    EndBlock,
    Routine
} from "./types";

import {preprocess, parseLines} from "./lexer";
import { ceilOffTo, zeroPad, inesertBefore, inesertAfter } from "./utils";

export function parseGcode(progStr: string): Routine {
    let preProcessed = preprocess(progStr);
    let gcode = parseLines(preProcessed);
    let prog = splitBlocks(gcode);
    prog = splitStartAndEndBlock(prog);
    let name = "0001"
    let exit: boolean = false;
    for (let b of prog.blocks) {
        for (let l of b.lines) {
            for (let token of l.tokens) {
                if (token.image[0] === "O") {
                    name = token.image.slice(1);
                    _.pull(b.lines, l);
                    exit = true;
                    break;
                }
            }
            if (exit) break;
        }
        if (exit) break;
    }
    prog.name = name;
    return prog;
}

export function splitStartAndEndBlock(prog: Routine): Routine {
    let lastBlock: BasicBlock = _.last(prog.blocks) as BasicBlock;

    if (lastBlock.type !== BlockType.Basic) {
        throw new Error('Last block is not a Basic Block');
    }

    let finalBlock = new EndBlock();

    let contains_m = (l: Line) => l.tokens.map((t: Token) => t.image[0]).some(s => s === 'M')
    while (lastBlock.lines.length > 0) {
        let last_line: Line = lastBlock.lines.pop();
        if (contains_m(last_line)) {
            finalBlock.lines.push(last_line);
        } else {
            lastBlock.lines.push(last_line);
            break;
        }
    }
    prog.blocks.push(finalBlock);
    finalBlock.lines = finalBlock.lines.reverse();

    let firstBlock = prog.blocks.shift();
    let startBlock = new StartBlock(firstBlock.lines);
    let blocks: Block[] = [startBlock];
    prog.blocks = blocks.concat(prog.blocks);
    return prog;
}

export function splitBlocks(lines: Line[]): Routine {
    let rest: Block[] = [];
    let cur_block: Block = new BasicBlock();
    for (let line of lines) {
        for (let token of line.tokens) {
            let image: string = token.image;
            if (image[0] === "T") { //start toolchange
                rest.push(cur_block);
                cur_block = new ToolchangeBlock();
            }
            else if ((image === "M3" || image === "M4") && cur_block.type == BlockType.Toolchange) {
                cur_block.lines.push(line);
                rest.push(cur_block);
                cur_block = new BasicBlock();
                line = null;
            }
        }
        if (line)
            cur_block.lines.push(line);
    }
    rest.push(cur_block);
    return new Routine(null, rest);
}

function getBiggestVariable(prog: Routine): number {
    return 1;
}
function getBiggestLineNumber(prog: Routine): number {
    return 1;
}

export function getBiggest(prog: Routine): [number, number] { //var, lable
    let variableNum = (prog.nextVariable === null) ? getBiggestVariable(prog) : prog.nextVariable;
    let lineNum = (prog.nextLineNumber === null) ? getBiggestLineNumber(prog) : prog.nextLineNumber;
    return [variableNum, lineNum]; //TODO implement this
}


export function multiply(prog: Routine, amountX: number, amountY: number, pitchX: number, pitchY: number): Routine {

    let [nextVar, nextLabel] = getBiggest(prog);
    nextLabel = ceilOffTo(nextLabel, 1000);

    let yCounter = zeroPad(nextVar++, 1);
    let xCounter = zeroPad(nextVar++, 1);
    let tmpY = zeroPad(nextVar++, 1);
    let tmpX = zeroPad(nextVar++, 1);

    let loopY = nextLabel;

    let startLoop: string =
        `#${yCounter}=0\n` +
        `N(PLACE_HOLDER)\n` +
        `#${tmpY}=[#${yCounter}*${pitchY}]\n` +
        `#${xCounter}=0\n` +
        `N(PLACE_HOLDER)\n` +
        `#${tmpX}=[#${xCounter}*${pitchX}]\n` +
        `G52X#${tmpX}Y#${tmpY}\n`;

    let endLoop: string =
        `#${xCounter}=[#${xCounter}+1]\n` +
        `IF[#${xCounter}LT${amountX}]GOTO(PLACE_HOLDER)\n` +
        `#${yCounter}=[#${yCounter}+1]\n` +
        `IF[#${yCounter}LT${amountY}]GOTO(PLACE_HOLDER)\n`;

    let loopBeginBlock = new LoopStartBlock(parseLines(preprocess(startLoop, false)));
    loopBeginBlock.line = loopY;
    prog = inesertBefore(prog, loopBeginBlock, BlockType.Basic);

    let loopEndBlock = new LoopEndBlock(parseLines(preprocess(endLoop, false)));
    loopEndBlock.line = loopY;
    prog = inesertAfter(prog, loopEndBlock, BlockType.Basic);

    //insert gcode last in startBlock
    for (let block of prog.blocks) {
        if (block.type === BlockType.Start) {
            let tmp = parseLines(preprocess(`G52X0Y0Z0\n`));
            block.lines.push(tmp[0]);
            break;
        }
    }

    //insert gcode first in EndBlock
    for (let block of prog.blocks) {
        if (block.type === BlockType.End) {
            let tmp = parseLines(preprocess(`G52X0Y0Z0\n`));
            block.lines.unshift(tmp[0]);
            break;
        }
    }
    return prog;
}
