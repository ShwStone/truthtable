class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
    }

    getNextToken() {
        if (this.position >= this.input.length) {
            return new Token('EOF', null);
        }

        const currentChar = this.input[this.position];

        if (/\s/.test(currentChar)) {
            this.position++;
            return this.getNextToken();
        }

        if (/[A-Za-z]/.test(currentChar)) {
            let identifier = '';
            while (this.position < this.input.length && /[A-Za-z0-9]/.test(this.input[this.position])) {
                identifier += this.input[this.position];
                this.position++;
            }
            return new Token('IDENTIFIER', identifier);
        }

        if (currentChar === '¬' || currentChar === '~') {
            this.position++;
            return new Token('NOT', '¬');
        }

        if (currentChar === '∧' || currentChar === '&') {
            this.position++;
            return new Token('AND', '∧');
        }

        if (currentChar === '∨' || currentChar === '|') {
            this.position++;
            return new Token('OR', '∨');
        }

        if (currentChar === '⊕' || currentChar === '^') {
            this.position++;
            return new Token('XOR', '⊕');
        }

        if (currentChar === '→' || currentChar === '>') {
            this.position++;
            return new Token('IMPLIES', '→');
        }

        if (currentChar === '←' || currentChar === '<') {
            this.position++;
            return new Token('CONVERSE', '←');
        }

        if (currentChar === '↔' || currentChar === '=') {
            this.position++;
            return new Token('IFF', '↔');
        }

        if (currentChar === '(') {
            this.position++;
            return new Token('LPAREN', '(');
        }

        if (currentChar === ')') {
            this.position++;
            return new Token('RPAREN', ')');
        }

        throw new Error(`Unknown character: ${currentChar}`);
    }
}

class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
    }

    eat(tokenType) {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            throw new Error(`Unexpected token: ${this.currentToken.type}`);
        }
    }

    factor() {
        const token = this.currentToken;

        if (token.type === 'IDENTIFIER') {
            this.eat('IDENTIFIER');
            return { type: 'IDENTIFIER', value: token.value };
        } else if (token.type === 'NOT') {
            this.eat('NOT');
            return { type: 'NOT', expr: this.factor() };
        } else if (token.type === 'LPAREN') {
            this.eat('LPAREN');
            const node = this.parse();
            this.eat('RPAREN');
            return node;
        }

        throw new Error(`Unexpected token: ${token.type}`);
    }

    priority = ['IFF', 'CONVERSE', 'IMPLIES', 'XOR', 'OR', 'AND'];

    parse(op = 'IFF') {
        const next_pos = this.priority.findIndex((s) => (s === op)) + 1;
        const next_parser = (next_pos === this.priority.length) 
                          ? () => this.factor()
                          : () => this.parse(this.priority[next_pos]);
        
        let node = next_parser();
        
        while (this.currentToken.type === op) {
            const token = this.currentToken;
            this.eat(op);
            node = { type: op, left: node, right: next_parser() };
        }

        return node;
    }
}

function evaluate(node, variables) {
    if (node.type === 'IDENTIFIER') {
        return variables[node.value];
    } else if (node.type === 'NOT') {
        return !evaluate(node.expr, variables);
    } else if (node.type === 'AND') {
        return evaluate(node.left, variables) && evaluate(node.right, variables);
    } else if (node.type === 'OR') {
        return evaluate(node.left, variables) || evaluate(node.right, variables);
    } else if (node.type === 'XOR') {
        return Boolean(evaluate(node.left, variables) ^ evaluate(node.right, variables));
    } else if (node.type === 'IMPLIES') {
        return !evaluate(node.left, variables) || evaluate(node.right, variables);
    } else if (node.type === 'CONVERSE') {
        return evaluate(node.left, variables) || !evaluate(node.right, variables);
    } else if (node.type === 'IFF') {
        return evaluate(node.left, variables) === evaluate(node.right, variables);
    }

    throw new Error(`Unknown node type: ${node.type}`);
}

const unaryOperators = ['NOT']
const binaryOperators = ['AND', 'OR', 'XOR', 'IMPLIES', 'CONVERSE', 'IFF']

function getVariables(node, variables = new Set()) {
    if (node.type === 'IDENTIFIER') {
        variables.add(node.value);
    } else if (unaryOperators.includes(node.type)) {
        getVariables(node.expr, variables);
    } else if (binaryOperators.includes(node.type)) {
        getVariables(node.left, variables);
        getVariables(node.right, variables);
    }
    return variables;
}

function generateTruthTable(expression) {
    const lexer = new Lexer(expression);
    const parser = new Parser(lexer);
    const ast = parser.parse();

    const variables = Array.from(getVariables(ast)).sort();
    const truthTable = [];

    const numRows = Math.pow(2, variables.length);

    for (let i = 0; i < numRows; i++) {
        const row = {};
        for (let j = 0; j < variables.length; j++) {
            let pos = variables.length - j - 1;
            row[variables[pos]] = Boolean((i >> j) & 1);
        }
        row['RESULT'] = evaluate(ast, row);
        truthTable.push(row);
    }

    return { variables, truthTable };
}
