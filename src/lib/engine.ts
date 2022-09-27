import * as chevrotain from 'chevrotain';
import * as _ from 'lodash';

type Token = chevrotain.IToken;
type LexingResult = chevrotain.ILexingResult;
class Line {
    line: string;
    tokens: Token[];
}
enum DirectionType {
    Before = 0,
    After,
}
enum BlockType {
    NullType = 0,
    Start,
    Basic,
    Toolchange,
    LoopStart,
    LoopEnd,
    Custom,
    End
}
class Block {
    type: BlockType = 0;
    lines: Line[];

    constructor(l: Line[] = []) {
        this.lines = l;
    }

    public toString(): string {
        return this.lines
            .map((l: Line) => l.line)
            .join("\n")
    }
};
class BasicBlock extends Block {
    type: BlockType = BlockType.Basic;
}

class ToolchangeBlock extends Block {
    type: BlockType = BlockType.Toolchange;
}

class StartBlock extends Block {
    type: BlockType = BlockType.Start;
}

class LoopStartBlock extends Block {
    type: BlockType = BlockType.LoopStart;
}

class LoopEndBlock extends Block {
    type: BlockType = BlockType.LoopEnd;
}

class CustomBlock extends Block {
    type: BlockType = BlockType.Custom;
}

class EndBlock extends Block {
    type: BlockType = BlockType.End;
}

class Routine {
    name: string | null;
    blocks: Block[];

    public toString(): string {
        return `%\nO${this.name}\n` +
        this.blocks
            .map((b: Block) => b.toString() + "\n")
            .join("\n") +
            "%"
    }

    constructor(n: string | null = null, b: Block[] = []) {
        this.name = n;
        this.blocks = b;
    }
}

export function preprocess(program: string): string {
    const gcode_strings = program.toLocaleUpperCase().split("\n");
    const gcodes: string[] = gcode_strings
        .map((x: string) => x.trim())
        .map((x: string) => x.replace(/\s/g, ''))
        .map((x: string) => x.replace(/%/g, ''))
        .map((x: string) => x.split(";")[0])
        .filter((x: string) => x!!);

    const noComents = []
    for (let line of gcodes) {
        while (line.indexOf("(") != -1) {
            let start = line.indexOf("(");
            let end = line.indexOf(")");
            line = line.slice(0, start) + line.slice(end + 1)
        }
        noComents.push(line);
    }

    return noComents
        .map((x: string) => x.replace(/\s/g, ''))
        .filter((x: string) => x!!)
        .join("\n");
}

function createLexer() {
    const command = chevrotain.createToken({ name: "command", pattern: /[G,M,T,S]\d+(\.\d)?/ });
    const parameter = chevrotain.createToken({ name: "parameter", pattern: /[A,B,C,D,F,I,J,K,P,Q,R,U,V,W,X,Y,Z]\-?\d*(\.\d*)?/ });
    const lables = chevrotain.createToken({ name: "label", pattern: /[N,O]\d+/ });
    const expression_1 = chevrotain.createToken({ name: "expression", pattern: /[A-Z][A-Z]+.*/ });
    const expression_2 = chevrotain.createToken({ name: "expression", pattern: /.*#.*/ });

    const allTokens = [
        expression_1,
        expression_2,
        lables,
        command,
        parameter
    ]
    let lexer = new chevrotain.Lexer(allTokens, {
        positionTracking: "onlyOffset"
    })
    return lexer;
}

export function parseLines(p: string): Line[] {
    const prog = preprocess(p);
    const inputTexts = prog.split("\n");
    const lexer = createLexer();
    const res: Line[] = []
    for (let input of inputTexts) {
        const lexingResult: LexingResult = lexer.tokenize(input);
        lexingResult.tokens.forEach((x: Token) => {
            let image = x.image;
            if (x.tokenType.name === "command") {
                let nr = +(image.slice(1))
                image = image[0] + nr.toString();
                x.image = image;
            }
        });
        const line: Line = { line: input, tokens: lexingResult.tokens };
        res.push(line);
    }
    return res;
}

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

export function getBiggest(prog: Routine): [number, number] { //var, lable
    return [1, 2000]; //TODO implement this
}

export function insertCustomGcodeBefore(prog: routine, code: string, t: blocktype): Routine {
    let customBlock = new LoopStartBlock(parseLines(preprocess(code)));
    prog = inesertBefore(prog, customBlock, t);
    return prog;
}

export function insertCustomGcodeAfter(prog: routine, code: string, t: blocktype): Routine {
    let customBlock = new LoopStartBlock(parseLines(preprocess(code)));
    prog = inesertAfter(prog, customBlock, t);
    return prog;
}

export function inesertAfter(prog: Routine, block: Block, afterType: BlockType): Routine {
    let blocks: Block[] = prog.blocks
        .map( (b: Block) => (b.type === afterType)? [b, block] : [b] )
        .flat();
    prog.blocks = blocks;
    return prog;
}

export function inesertBefore(prog: Routine, block: Block, beforeType: BlockType): Routine {
    let blocks: Block[] = prog.blocks
        .map( (b: Block) => (b.type === beforeType)? [block, b] : [b] )
        .flat();
    prog.blocks = blocks;
    return prog;
}

export function multiply(prog: Routine, amountX: number, amountY: number, pitchX: number, pitchY: number): Routine {
    const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

    let [nextVar, nextLabel] = getBiggest(prog);
    nextVar += 1;
    nextLabel += 1;

    let yCounter = zeroPad(nextVar++, 1);
    let xCounter = zeroPad(nextVar++, 1);
    let tmpY = zeroPad(nextVar++, 1);
    let tmpX = zeroPad(nextVar++, 1);

    let loopY = zeroPad(nextLabel++, 4);
    let loopX = zeroPad(nextLabel++, 4);

    let startLoop: string =
                            `#${yCounter}=0\n`                      +
                            `N${loopY}\n`                           +
                            `#${tmpY}=[#${yCounter}*${pitchY}]\n`   +
                            `#${xCounter}=0\n`                      +
                            `N${loopX}\n`                           +
                            `#${tmpX}=[#${xCounter}*${pitchX}]\n`   +
                            `G52X#${tmpX}Y#${tmpY}\n`;

    let endLoop: string =
                            `#${xCounter}=[#${xCounter}+1]\n`               +
                            `IF[#${xCounter}LT${amountX}]GOTO${loopX}\n`    +
                            `#${yCounter}=[#${yCounter}+1]\n`               +
                            `IF[#${yCounter}LT${amountY}]GOTO${loopY}\n`;


    let loopBeginBlock = new LoopStartBlock(parseLines(preprocess(startLoop)));
    prog = inesertBefore(prog, loopBeginBlock, BlockType.Basic);

    let loopEndBlock = new LoopEndBlock(parseLines(preprocess(endLoop)));
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
