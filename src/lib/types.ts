export type Token = chevrotain.IToken;
export type LexingResult = chevrotain.ILexingResult;
export class Line {
    line: string;
    tokens: Token[];
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
        return this.lines
            .map((l: Line) => l.line)
            .join("\n")
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
    line: number | null = null; //TODO: kinda hack here

    public toString(): string {
        const hashPlaceHolder = (l: Line) => { return l.line.includes("(PLACE_HOLDER)") };
        const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')
        let st: string = "";

        for (let line of this.lines) {
            let x = hashPlaceHolder(line);
            if (!x) {
                st += line.line;
            } else {
                st += `N${zeroPad(this.line, 4)}`;
                this.line += 1;
            }
            st += "\n";
        }
        return st;
    }
}

export class LoopEndBlock extends Block {
    type: BlockType = BlockType.LoopEnd;
    line: number | null = null;

    public toString(): string {
        const hashPlaceHolder = (l: Line) => { return l.line.includes("(PLACE_HOLDER)") };
        const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')
        let st: string = "";

        for (let line of this.lines) {
            if (!hashPlaceHolder(line)) {
                st += line.line;
            } else {
                st += line.line.replace("(PLACE_HOLDER)", zeroPad(this.line ^ 1, 4));
                this.line += 1;
            }
            st += "\n";
        }
        return st;
    }
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
