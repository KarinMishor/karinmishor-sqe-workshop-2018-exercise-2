import * as esprima from 'esprima';
//import * as escodegen from 'escodegen';
let dataForTable=[];
let line;
let parse;
let startFunc =false;
let globalMap = new Map();
let localMap= new Map();
let currMap;

const parseCode = (codeToParse) => {
    parse =  esprima.parseScript(codeToParse);
    dataForTable=[];
    startFunc =false;
    line=1;

    return parse;
};

export {parseCode};
export {getParseData};
export {dataForTable};



function getParseData(parse) {
    try {
        findGlobals(parse);
        findFirstBodyType(parse);
    }
    catch (e) {
        return 'wrong input!';
    }
}

function findGlobals(parsedObj){
    for (let i = 0; i < parsedObj.body.length && startFunc==false; i++) {
        findType(parsedObj.body[i]);
    }
}

function findFirstBodyType(parsedObj) {
    let body;
    if (parsedObj.body[0].body) {
        body = parsedObj.body[0].body.body;
    } else {
        let len = parsedObj.body.length;
        body = parsedObj.body[len - 1].body.body;
    }
    for (let i = 0; i < body.length; i++) {
        findType(body[i],false);
    }
}
function findBodyType(parsedObj,ifInScope) {
    if (parsedObj.body) {
        for (let i = 0; i < parsedObj.body.length; i++) {
            findType(parsedObj.body[i],ifInScope);
        }

    } else
        findType(parsedObj,ifInScope);
}

/*function bodyParse(parse) {
    try {
        for (let i = 0; i < (parse.body).length; i++) {
            findType((parse.body)[i]);
        }
    }  catch (e) {
        return 'wrong input!';
    }
}
*/


function pushLineToQ (line,type,name,condition,value){
    dataForTable.push({ 'line': line, 'type': type, 'name': name, 'condition' : condition, 'value': value} )  ;
}

function findType(parsedObj,ifInScope) {
    let type = parsedObj.type;
    if (type == ('VariableDeclaration'))
        VariableDeclaration(parsedObj,ifInScope);
    else if (type == ('ExpressionStatement'))
        ExpressionStatement(parsedObj,ifInScope);
    else if (type== 'FunctionDeclaration') {
        startFunc = true;
        FunctionDeclaration(parsedObj);
    }
    else findComplexType(parsedObj);
}

function findComplexType(parsedObj) {
    let type = parsedObj.type;
    if(type==('WhileStatement'))
        WhileStatement(parsedObj);
    else if(type==('ForStatement'))
        forStatement(parsedObj);
    else if(type==('IfStatement'))
        IfStatement(parsedObj);
    else/* if(type==('ReturnStatement'))*/
        ReturnStatement(parsedObj);
    /*  else return 0;*/
}
function FunctionDeclaration (parsedCode){
    if(parsedCode.body[0]){
        parsedCode=parsedCode.body[0];
    }
    let funName = (parsedCode).id.name;
    pushLineToQ(line,'function declaration',funName,'','');
    for(let i=0;i<(parsedCode).params.length; i++)
    { //if there are params
        AddToMapFunctionDeclaration(parsedCode);
        let param=(parsedCode).params[i];
        pushLineToQ(line,'variable declaration' , param.name, '','');
    }
    line++;
}

function ReturnStatement(parsedObj){
    let val =  parseExpression(parsedObj.argument);
    pushLineToQ(line,'return statement' , '', '',val);
    line++;
}

function IfStatement(parsedObj){
    let condition=  parseExpression(parsedObj.test);
    pushLineToQ(line,'if statement','',condition,'');
    line++;
    currMap=new Map(localMap);
    let body =parsedObj.consequent;
    // findType((body));
    findBodyType(body,true);
    if(parsedObj.alternate){
        if(parsedObj.alternate.type=='IfStatement') {
            elseIfStatement(parsedObj.alternate);
        }
        else{elseStatement(parsedObj.alternate);}
    }
    else return;

}
function elseIfStatement(parsedObj) {
    let condition=  parseExpression(parsedObj.test);
    pushLineToQ(line,'else if statement','',condition,'');
    line++;
    let body =parsedObj.consequent;
    currMap=new Map(localMap);
    // findType((body));
    findBodyType(body,true);
    if(parsedObj.alternate) {
        if (parsedObj.alternate.type == 'IfStatement')
            elseIfStatement(parsedObj.alternate);
        else/* if (parsedObj.alternate.type != 'IfStatement')*/ elseStatement(parsedObj.alternate);
    }
}

function elseStatement(parsedObj) {
    pushLineToQ(line,'else statement','','','');
    line++;
    //findType((parsedObj));
    //findType((parsedObj));
    currMap=new Map(localMap);
    findBodyType(parsedObj,true);
}

function forStatement(parsedObj) {
    let part1,part2,part3;
    if (parsedObj.init.type == 'AssignmentExpression') {
        let name = parsedObj.init.left.name; let right = parsedObj.init.right;
        right = parseExpression(right); part1 = name+''+parsedObj.init.operator+''+right; }
    else /*if (parsedObj.init.type == 'VariableDeclaration')*/{
        let name = parsedObj.init.declarations[0].id.name; let right = parsedObj.init.declarations[0].init;
        right = parseExpression(right); part1 = name + '=' + right; }
    part2= parseExpression(parsedObj.test);
    if(parsedObj.update.type=='UpdateExpression'){
        let name = parsedObj.update.argument.name; let op = parsedObj.update.operator; part3=name+''+op; }
    else/*if(parsedObj.update.type=='AssignmentExpression')*/{
        let name = parsedObj.update.left.name; let right = parsedObj.update.right;
        right = parseExpression(right); part3=name+''+parsedObj.update.operator+''+right; }
    let condition=part1+';'+part2+';'+part3; pushLineToQ(line,'for statement','',condition,'');
    line++;
    currMap=new Map(localMap);
    findBodyType(parsedObj.body,true);
}


function WhileStatement(parsedObj) {
    let condition = parseExpression(parsedObj.test);
    pushLineToQ(line, 'while statement', '', condition, '');
    line++;
    currMap=new Map(localMap);
    findBodyType(parsedObj.body,true);
}
function VariableDeclaration (parsedObj,inScope){
    let val;
    for(let i=0;i<parsedObj.declarations.length; i++) {
        let VC = parsedObj.declarations[i];
        if(VC.init) {
            val = parseExpression(VC.init);
            if(startFunc)
            {let rightToAdd =val; let newVar=replaceLocals(rightToAdd);
                if(inScope) currMap[VC.id.name]=newVar;
                else  localMap[VC.id.name]=newVar;
            } else {
                globalMap[name]=val; }
        }
        else {
            val='';
        }
        pushLineToQ(line, 'variable declaration', VC.id.name,'',val);
    }
    line++;
}

function ExpressionStatement (parsedObj,inScope){
    if(parsedObj.expression.type=='AssignmentExpression') {
        let name = parsedObj.expression.left;
        let right = parsedObj.expression.right;
        right = parseExpression(right);
        name= parseExpression(name);
        pushLineToQ(line,'assignment expression',name,'',right);

        if(startFunc)
        {let rightToAdd =right; let newVar=replaceLocals(rightToAdd);
            if(inScope) currMap[name]=newVar;  else localMap[name]=newVar;
        } else { globalMap[name]=right; }
    }
    else/* if(parsedObj.expression.type=='UpdateExpression') */{
        let name = parsedObj.expression.argument.name;
        let op = parsedObj.expression.operator;
        pushLineToQ(line,'update expression',name,'',name+''+op);
    }
    line++;
}

function parseExpression(exp) {
    if (exp.type == ('BinaryExpression'))
        return parseBinary(exp);
    else {
        return simpleExpression(exp);
    }
}
function simpleExpression(exp){
    if(exp.type=='Identifier') {
        return exp.name;
    }
    else if(exp.type=='Literal') {
        return exp.value;
    }
    else if(exp.type=='UnaryExpression')
        return exp.operator+''+exp.argument.value;

    else/*if(exp.type=='MemberExpression')*/ {
        if(exp.property.name=='length'){
            return exp.object.name + '.' + parseExpression(exp.property) ;
        }
        return exp.object.name + '[' + parseExpression(exp.property) + ']';
    }
    /* else return;*/
}

function parseBinary(binary) {
    let leftExp = binary.left;
    if (leftExp.type == ('BinaryExpression'))
        leftExp =  '(' + parseBinary(leftExp)+')';
    else {
        leftExp = simpleExpression(leftExp);
    }
    let rigthExp = binary.right;
    if (rigthExp.type == ('BinaryExpression'))
        rigthExp =  '('+ parseBinary(rigthExp)+')';
    else {
        rigthExp = simpleExpression(rigthExp);
    }
    return leftExp + '' + binary.operator + '' + rigthExp;
}

/*function addToMap(parsedObj){
    if(startFunc)
    {
        var right=parseExpression(parsedObj);
        var newVar=replaceLocals(right);
        localMap[parsedObj.declarations[0].id.name]=newVar;
    }
    else {
        globalMap[parsedObj.declarations[0].id.name]=parsedObj.declarations[0].init.value;
    }
}
*/
function replaceLocals(parsedObj) {
    let newArr=parsedObj;
    let oldArr =parsedObj;
    if(parsedObj.length>1) {
        newArr = parsedObj.split(/[\s<>,=()*/;{}%+-]+/).filter(s => s !== '');
        oldArr = parsedObj.split(/[\s<>,=()*/;{}%+-]+/).filter(s => s !== '');
    }
    //var operators=parsedObj.split(/[^\s<>=]+/);
    for(let i=0; i<newArr.length; i++) {
        if(localMap[newArr[i]]!==undefined){
            newArr[i]=localMap[newArr[i]];
        }
    }
    var right=parsedObj;
    for(let i=0; i<newArr.length; i++) {
        right=right.replace(oldArr[i],newArr[i]);
        i++;
    }
    return right;
}

function AddToMapFunctionDeclaration(parsedJsonCode) {
    for(let i=0; i<parsedJsonCode.params.length; i++) {
        if(globalMap[parsedJsonCode.params[i].name]==null){
            globalMap[parsedJsonCode.params[i].name]=parsedJsonCode.params[i].name;
        }
    }
}


