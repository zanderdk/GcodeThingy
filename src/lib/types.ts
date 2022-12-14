export type Token = chevrotain.IToken;
export type LexingResult = chevrotain.ILexingResult;

export enum MacroType {
    MACRO_A = 0,
    MACRO_B,
    HEIDENHAIN
}

export class Line {
    line: string;
    tokens: Token[];

    public toString() {
        if (this.line.trim())
            return this.line;
        return "";
    }
}

export enum BlockType {
    NullType = 0,
    Start,
    Basic,
    Toolchange,
    LoopStart,
    LoopEnd,
    Custom,
    End
}
export class Block {
    type: BlockType = 0;
    lines: Line[];

    constructor(l: Line[] = []) {
        this.lines = l;
    }

    public toString(): string {
        let st: string = "";

        for (let line of this.lines) {
            if (line.line.trim())
                st += line.line.trim() + "\n";
        }
        return st;
    }
};
export class BasicBlock extends Block {
    type: BlockType = BlockType.Basic;
}

export class ToolchangeBlock extends Block {
    type: BlockType = BlockType.Toolchange;
}

export class StartBlock extends Block {
    type: BlockType = BlockType.Start;
}

export class LoopStartBlock extends Block {
    type: BlockType = BlockType.LoopStart;
    lineNumber: number | null = null; //TODO: kinda hack here
}

export class LoopEndBlock extends Block {
    type: BlockType = BlockType.LoopEnd;
    lineNumber: number | null = null;
}

export class CustomBlock extends Block {
    type: BlockType = BlockType.Custom;
}

export class EndBlock extends Block {
    type: BlockType = BlockType.End;
}

export class Routine {
    name: string | null;
    blocks: Block[];
    nextLineNumber: number | null = null;
    nextVariable: number | null = null;

    public toString(): string {
        console.debug("toString from Routine");
        return `%\nO${this.name}\n` +
            this.blocks
                .map((b: Block) => b.toString())
                .join("\n") +
            "%";
    }

    constructor(n: string | null = null, b: Block[] = []) {
        this.name = n;
        this.blocks = b;
    }
}
