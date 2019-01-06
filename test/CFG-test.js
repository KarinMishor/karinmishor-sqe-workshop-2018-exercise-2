import assert from 'assert';
import {executeCFG} from '../src/js/CFG.js';
import {parseCode,getParseData} from '../src/js/code-analyzer.js';


describe('check all types1',()=>{
    it('example2', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('function foo(x, y, z){\n'+
            'let a = x + 1;\n'+ 'let b = a + y;\n'+
            'let c = 0;\n'+
            'if (b < z) {\n'+
            'c = c + 5;\n'+
            'return x + y + z + c;\n'+
            '} else if (b < z * 2) {\n'+
            'c = c + x + 5;\n'+
            'return x + y + z + c;\n'+
            '} else {\n'+ 'c = c + z + 5;\n'+
            'return x + y + z + c;\n'+ '}\n'+ ' }' );
        let recieve = getParseData(text,params);
        let ans='function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 0 + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (0 + x) + 5;\n    } else {\n        return x + y + z + (0 + z) + 5;\n    }\n}\n';
        assert.deepEqual(ans, recieve);
    });
});

describe('check all types1',()=>{
    it('wrong', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('funct' );
        let recieve = getParseData(text,params);
        let ans='wrong input!';
        assert.deepEqual(ans, recieve);
    });
});

describe('check all types1',()=>{
    it('example4', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('function foo(x, y, z){\n'+
            'if (1 < z)\n'+
            'return x + y + z + 1};\n');
        let recieve = getParseData(text,params);
        let ans='function foo(x, y, z) {\n    if (1 < z)\n        return x + y + z + 1;\n;\n';
        assert.deepEqual(ans, recieve);
    });
});

describe('check all types1',()=>{
    it('example5', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('function foo(x, y, z){\n'+ '}');
        let recieve = getParseData(text,params);
        let ans='function foo(x, y, z) {\n}\n';
        assert.deepEqual(ans, recieve);
    });
});

describe('check all types1',()=>{
    it('example5', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('let a = 1;\n' + ' a = 3;\n' +'function foo(x, y, z){\n'+ '}');
        let recieve = getParseData(text,params);
        let ans='let a = 1;\na = 3;\nfunction foo(x, y, z) {\n';
        assert.deepEqual(ans, recieve);
    });
});

describe('check all types1',()=>{
    it('example2', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('function foo(x, y, z){\n'+
            'let a = x + 1;\n'+ 'let b = a + y;\n'+
            'let c;\n'+
            'if (b < z) {\n'+
            'let c = c + 5;\n'+
            'return x + y + z + c;\n'+
            '} else{\n'+
            'c = c + x + 5;\n'+
            'return x + y + z + c;\n'+
            '}\n'+ '}' );
        let recieve = getParseData(text,params);
        let ans='function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 0 + 5;\n    } else {\n        return x + y + z + (0 + x) + 5;\n    }\n';
        assert.deepEqual(ans, recieve);
    });
});

describe('check all types1',()=>{
    it('example2', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('function foo(x, y, z){\n'+
            'let a = x + 1;\n'+ 'let b = a + y;\n'+
            'let c = 0;\n'+
            'if (b < z) {\n'+
            'c = c + 5;\n'+
            'return x + y + z + c;\n'+
            '} else if (b < z * 2) {\n'+
            'c = c + x + 5;\n'+
            'return x + y + z + c;\n'+
            '} \n'+ ' }' );
        let recieve = getParseData(text,params);
        let ans='function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 0 + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (0 + x) + 5;\n    }\n';
        assert.deepEqual(ans, recieve);
    });
});

describe('check all types1',()=>{
    it('example2', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('function foo(x, y, z){\n'+
            'let a = x + 1;\n'+ 'let b = a + y;\n'+
            'c = 1;\n'+
            'if (b < z) {\n'+
            'c = c + 5;\n'+
            'return x + y + z + c;\n'+
            '} else if (b < z * 2) {\n'+
            'c = c + x + 5;\n'+
            'return x + y + z + c;\n'+
            '} \n'+ ' }' );
        let recieve = getParseData(text,params);
        let ans='function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 1 + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (1 + x) + 5;\n    }\n';
        assert.deepEqual(ans, recieve);
    });
});

describe('check all types1',()=>{
    it('example2', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('function foo(x, y, z){\n'+
            'let a = x + 1;\n'+ 'let b = a + y;\n'+
            'let c = 0;\n'+
            'if (b < z) {\n'+
            'c = c + 5;\n'+
            'return x + y + z + c;\n'+
            '} else if (b < z * 2) {\n'+
            'c = c + x + 5;\n'+
            'return x + y + z + c;\n'+
            '} else if (b < z * 2) {\n'+ 'c = c + z + 5;\n'+
            'return x + y + z + c;\n'+ '}\n'+ ' }' );
        let recieve = getParseData(text,params);
        let ans='wrong input!';
        assert.deepEqual(ans, recieve);
    });
});



describe('check CFG',()=>{

    it('example1', ()=>{
        let textCode = ('function foo(x, y, z){\n'+
            'let a = 1 + x;\n'+
            'let b = a + y;\n'+
            'return z;\n'+
            '}' );
        let temp=parseCode(textCode);
        let newFunction=executeCFG(temp,textCode);
        assert.deepEqual('n1 [label="(1)\n'+
            'a = 1 + x;", shape = "box"]\n'+
            'n2 [label="(2)\n'+
            'b = a + y;", shape = "box"]\n'+
            'n3 [label="(3)\n'+
            'return z;", shape = "box"]\n'+
            'n1 -> n2 []\n'+
            'n2 -> n3 []\n' +
            '\n',newFunction); });
});

describe('check CFG',()=>{

    it('example2', ()=>{
        let textCode = ('function x(){\n' +
        'let b=0;\n' +
        'if(a==0){\n' +
        '\treturn "a";\n' +
        '\n'+ '}\n' + '}'+'\n   ' );
        let temp=parseCode(textCode);
        let newFunction=executeCFG(temp,textCode);
        assert.deepEqual('n1 [label="(1)\n'+
        'b=0;", shape = "box"]\n'+
        'n2 [label="(2)\n'+
        'a==0", shape = "diamond"]\n'+
        'n3 [label="(3)\n'+
        'return \\"a\\";", shape = "box"]\n'+
        'n1 -> n2 []\n'+
        'n2 -> n3 [label="true"]\n'+ '\n',newFunction);
    });
});

