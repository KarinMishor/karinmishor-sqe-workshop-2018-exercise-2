import assert from 'assert';
import {parseCode,getParseData} from '../src/js/code-analyzer';

describe('save info and create table',()=>{

    it('function with var assign', ()=>{
        let code='function x(a){\nlet b=a;\n}';
        let params='a=1';
        let temp=parseCode(code);
        let newFunction=getParseData(temp,params);
        assert.deepEqual('function x(a) {\n}\n',newFunction);
    });
});


describe('check all types1',()=>{
    it('example3', ()=> {
        let params= 'x=1,y=2,z=3';
        let text = parseCode('function foo(x, y, z){\n'+
            'let a = 1 + x;\n'+
            'let b = a + y;\n'+
            'let c = 0;\n'+
            'while (a < z) {\n'+
            'c = a + b;\n'+
            'z = c * 2;\n'+
            '}\n'+
            'return z;\n'+
    '}' );
        let recieve = getParseData(text,params);
        let ans='function foo(x, y, z) {\n    while (1 + x < z) {\n    }\n    return z;\n}\n';
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
        '} else {\n'+ 'c = c + z + 5;\n'+
            'return x + y + z + c;\n'+ '}\n'+ ' }' );
        let recieve = getParseData(text,params);
        let ans='function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 0 + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (0 + x) + 5;\n    } else {\n        return x + y + z + (0 + z) + 5;\n    }\n}\n';
        assert.deepEqual(ans, recieve);
    });
});