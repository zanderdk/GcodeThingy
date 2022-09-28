import * as chevrotain from 'chevrotain';

import {
    type Token,
    type LexingResult,
    Line,
} from "./types";

function createLexer() {
    const command = chevrotain.createToken({ name: "command", pattern: /[G,M,T,S]\d+(\.\d)?/ });
    const parameter = chevrotain.createToken({ name: "parameter", pattern: /[A,B,C,D,F,I,J,K,P,Q,R,U,V,W,X,Y,Z]\-?\d*(\.\d*)?/ });
    const lables = chevrotain.createToken({ name: "label", pattern: /[N,O]\d+/ });
    const expression_1 = chevrotain.createToken({ name: "expression", pattern: /[A-Z][A-Z]+.*/ });
    const expression_2 = chevrotain.createToken({ name: "expression", pattern: /.*#.*/ });
    const comment = chevrotain.createToken({ name: "expression", pattern: /\([A-Z]+\)/ });

    const allTokens = [
        expression_1,
        expression_2,
        lables,
        command,
        parameter,
        comment,
    ]
    let lexer = new chevrotain.Lexer(allTokens, {
        positionTracking: "onlyOffset"
    })
    return lexer;
}

export function preprocess(program: string, remove_comments: boolean = true): string {
    const gcode_strings = program.toLocaleUpperCase().split("\n");
    const gcodes: string[] = gcode_strings
        .map((x: string) => x.trim())
        .map((x: string) => x.replace(/\s/g, ''))
        .map((x: string) => x.replace(/%/g, ''))
        .map((x: string) => x.split(";")[0])
        .filter((x: string) => x!!);

    let noComents = []
    for (let line of gcodes) {
        while (line.indexOf("(") != -1) {
            let start = line.indexOf("(");
            let end = line.indexOf(")");
            line = line.slice(0, start) + line.slice(end + 1)
        }
        noComents.push(line);
    }

    if (!remove_comments) {
        noComents = gcodes;
    }

    return noComents
        .map((x: string) => x.replace(/\s/g, ''))
        .filter((x: string) => x!!)
        .join("\n");
}

export function parseLines(p: string): Line[] {
    const prog = p;
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
