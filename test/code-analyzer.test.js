import assert from 'assert';
import {parseCode, getParseData,dataForTable,bodyParse} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
});

describe('check all types1',()=>{
    it('function decleration with params and return', ()=>{
        let text=parseCode('function test(x) {return 1;}');
        getParseData(text);
        let ans=[{line:'1',
            type:'function declaration', name:'test', condition:'', value:''}, {line:'1', type:'variable declaration', name:'x', condition:'', value:''}, {line:'2', type:'return statement', name:'', condition:'', value:'1'}];
        assert.deepEqual(ans,dataForTable);
    });


    it('no function decleration ', ()=>{
        let text=parseCode('func');
        getParseData(text);
        let ans=[];
        assert.deepEqual(ans,dataForTable);
    });

});

describe('check all types2',()=>{
    it('While with binary body - condition with member', ()=>{
        let text=parseCode('while(x>a[0]){x=c+1}');
        bodyParse(text);
        let ans=[{line:'1', type:'while statement', name:'', condition:'x>a[0]', value:''},
            {line:'2', type:'assignment expression', name:'x', condition:'', value:'c+1'} ];
        assert.deepEqual(ans,dataForTable);
    });

    it('for with update exp and variable declaration', ()=>{
        let text=parseCode('for(i=0;i<10;i++){\n'
            +'let c= 1;}');
        bodyParse(text);
        let ans=[{line:'1', type:'for statement', name:'', condition:'i=0;i<10;i++', value:''},
            {line:'2', type:'variable declaration', name:'c', condition:'', value:'1'}];
        assert.deepEqual(ans,dataForTable);
    });
});

describe('check all types3',()=>{
    it('for with update exp and ass', ()=>{
        let text=parseCode('for(i=0;i<(x+10);i=i+10){\n'
            +'c= 1;}');
        bodyParse(text);
        let ans=[{line:'1', type:'for statement', name:'', condition:'i=0;i<(x+10);i=i+10', value:''},
            {line:'2', type:'assignment expression', name:'c', condition:'', value:'1'}];
        assert.deepEqual(ans,dataForTable);
    });

    it('for with update exp and variable declaration', ()=>{
        let text=parseCode('for(let i=0;i<10;i++){\n'
            +'let c= 1;}');
        bodyParse(text);
        let ans=[{line:'1', type:'for statement', name:'', condition:'i=0;i<10;i++', value:''},
            {line:'2', type:'variable declaration', name:'c', condition:'', value:'1'}];
        assert.deepEqual(ans,dataForTable);
    });
});
describe('check all types4',()=>{
    it('if & else if & else - exception throw', ()=>{
        let text=parseCode('if (a<0){ \n'+
            ' m=k[1]; } \n' + 'else if (a==0) { \n' + ' ;}\n' + 'else { \n' + 'a=b+1; }');
        bodyParse(text);
        let ans=[{line:'1', type:'if statement', name:'', condition:'a<0', value:''},
            {line:'2', type:'assignment expression', name:'m', condition:'', value:'k[1]'},
            {line:'3', type:'else if statement', name:'', condition:'a==0', value:''}, ];
        assert.deepEqual(ans,dataForTable); });
    it('if & else if & else', ()=>{
        let text=parseCode('if (a<0){ \n'+
            ' m=k[1]; } \n' + 'else if (a==0) { \n' + ' let x;}\n' + 'else { \n' + 'a=b+1; }');
        bodyParse(text);
        let ans=[{line:'1', type:'if statement', name:'', condition:'a<0', value:''},
            {line:'2', type:'assignment expression', name:'m', condition:'', value:'k[1]'},
            {line:'3', type:'else if statement', name:'', condition:'a==0', value:''},   {line:'4', type:'variable declaration', name:'x', condition:'', value:''},
            {line:'5', type:'else statement', name:'', condition:'', value:''},
            {line:'6', type:'assignment expression', name:'a', condition:'', value:'b+1'}];
        assert.deepEqual(ans,dataForTable); });
});
describe('check all types5',()=>{
    it('if & else binary', ()=>{
        let text=parseCode('if (a<0){ \n'+
            ' m=-1; } \n' + 'else { \n' + 'let x=((a+1)+(x+1));}');
        bodyParse(text);
        let ans=[{line:'1', type:'if statement', name:'', condition:'a<0', value:''},
            {line:'2', type:'assignment expression', name:'m', condition:'', value:'-1'},
            {line:'3', type:'else statement', name:'', condition:'', value:''},
            {line:'4', type:'variable declaration', name:'x', condition:'', value:'(a+1)+(x+1)'}];
        assert.deepEqual(ans,dataForTable);
    });

    it('only if ', ()=>{
        let text=parseCode('if (a<0){ \n'+ ' m=-1; } ');
        bodyParse(text);
        let ans=[{line:'1', type:'if statement', name:'', condition:'a<0', value:''},
            {line:'2', type:'assignment expression', name:'m', condition:'', value:'-1'}];
        assert.deepEqual(ans,dataForTable);
    });
});
describe('check all types6',()=> {
    it('if &  else', () => {
        let text = parseCode('if (a<0){ \n' +
            ' m++; } \n' +
            'else { \n' +
            'let x=((a+1)+(x+1));}');
        bodyParse(text);
        let ans = [{line: '1', type: 'if statement', name: '', condition: 'a<0', value: ''},
            {line: '2', type: 'update expression', name: 'm', condition: '', value: 'm++'},
            {line: '3', type: 'else statement', name: '', condition: '', value: ''},
            {line: '4', type: 'variable declaration', name: 'x', condition: '', value: '(a+1)+(x+1)'}];
        assert.deepEqual(ans, dataForTable);
    });
});

describe('check all types7',()=>{
    it('if & else if & else if', ()=>{
        let text=parseCode('if (a<0){ \n'+
            ' m=-1; } \n' +
            'else if (a==0){ \n' +
            'let x=1;}\n' +
            'else if (a>9) { \n' +
            'm=0;}');
        bodyParse(text);
        let ans=[{line:'1', type:'if statement', name:'', condition:'a<0', value:''},
            {line:'2', type:'assignment expression', name:'m', condition:'', value:'-1'},
            {line:'3', type:'else if statement', name:'', condition:'a==0', value:''},
            {line:'4', type:'variable declaration', name:'x', condition:'', value:'1'},
            {line:'5', type:'else if statement', name:'', condition:'a>9', value:''},
            {line:'6', type:'assignment expression', name:'m', condition:'', value:'0'}];
        assert.deepEqual(ans,dataForTable);
    });
});