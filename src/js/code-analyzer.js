import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
let dataForTable=[];
let line;
let parse;
let startFunc =false;
let globalMap = new Map();
let localMap= new Map();
let paramsArray;
let colorMap = new Map();
let lineMapCode = new Map();
let linesToRemove = new Map();


const parseCode = (codeToParse) => {
    parse =  esprima.parseScript(codeToParse);
    dataForTable=[];
    startFunc =false;
    line=1;

    return parse;
};

export {parseCode};
export {getParseData};
export {dataForTable,colorMap,lineMapCode};

/*function start(parse){
    // params = document.getElementById('varsPlace').value;
    getParseData(parse,params);
}
*/
function getParseData(parse,params) {
    try {
        //params = document.getElementById('varsPlace').value;
        setParams(params);
        findGlobals(parse);
        findFirstBodyType(parse);
        let newCode = escodegen.generate(parse);
        let newFunction = funcAfterSub(newCode);
        findIfStatements(newFunction);
        return newFunction;
    }
    catch (e) {
        return 'wrong input!';
    }
}


function funcAfterSub(newCode) {
    let newfunc='';
    newCode = newCode.split('\n');
    for (let i = 0; i < newCode.length; i++) {
        if (linesToRemove.get(i+1) == false ||linesToRemove.get(i+1) === undefined ) {
            newfunc += newCode[i] + '\n';
        }
    }
    return newfunc;
}

function findIfStatements(newCode){
    let array=newCode.split('\n');
    for(let i=0; i<array.length;i++){
        colorMap.set(i,array[i]);
        lineMapCode.set(i,array[i]);
    }
    for(let i=0; i<array.length;i++){
        if(colorMap.get(i).includes('if')){
            setColors(colorMap.get(i),i);
        }
        else colorMap.set(i,'0');
    }

}

function findGlobals(parsedObj){
    for (let i = 0; i < parsedObj.body.length && startFunc==false; i++) {
        findType(parsedObj.body[i],false,0);
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
        findType(body[i],false,localMap);
    }
}
function findBodyType(parsedObj,ifInScope,currLocal) {
    let currMap= new Map(currLocal);
    if (parsedObj.body) {
        for (let i = 0; i < parsedObj.body.length; i++) {
            findType(parsedObj.body[i],ifInScope,currMap);
        }

    } else
        findType(parsedObj,ifInScope,currMap);
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

function findType(parsedObj,ifInScope,currMap) {
    let type = parsedObj.type;
    if (type == ('VariableDeclaration'))
        VariableDeclaration(parsedObj,ifInScope,currMap);
    else if (type == ('ExpressionStatement'))
        ExpressionStatement(parsedObj,ifInScope,currMap);
    else if (type== 'FunctionDeclaration') {
        startFunc = true;
        FunctionDeclaration(parsedObj);
    }
    else findComplexType(parsedObj,currMap);
}

function findComplexType(parsedObj,currMap) {
    let type = parsedObj.type;
    if(type==('WhileStatement'))
        WhileStatement(parsedObj,currMap);
    /*else if(type==('ForStatement'))
        forStatement(parsedObj,currMap);*/
    else if(type==('IfStatement'))
        IfStatement(parsedObj,currMap);
    else/* if(type==('ReturnStatement'))*/
        ReturnStatement(parsedObj,currMap);
    /*  else return 0;*/
}
function FunctionDeclaration (parsedCode){
    /*  if(parsedCode.body[0]){
        parsedCode=parsedCode.body[0];
    }*/
    let funName = (parsedCode).id.name;
    pushLineToQ(line,'function declaration',funName,'','');
    for(let i=0;i<(parsedCode).params.length; i++)
    { //if there are params
        AddToMapFunctionDeclaration(parsedCode);
        let param=(parsedCode).params[i];
        pushLineToQ(line,'variable declaration' , param.name, '','');
    }
    linesToRemove.set(line,false);
    line++;
}

function ReturnStatement(parsedObj,currMap){
    let val =  parseExpression(parsedObj.argument);
    pushLineToQ(line,'return statement' , '', '',val);
    linesToRemove.set(line,false);
    line++;
    editJason(parsedObj.argument,currMap);
}

function IfStatement(parsedObj,currLocal){
    let condition=  parseExpression(parsedObj.test);
    pushLineToQ(line,'if statement','',condition,'');
    linesToRemove.set(line,false);
    line++;
    let currMap=new Map(currLocal);
    let body =parsedObj.consequent;
    // findType((body));
    findBodyType(body,true,currMap);
    editJason(parsedObj.test,currMap);
    if(parsedObj.alternate){
        if(parsedObj.alternate.type=='IfStatement') {
            elseIfStatement(parsedObj.alternate,currLocal);
        }
        else{elseStatement(parsedObj.alternate,currLocal);}
    }
    else return;

}
function elseIfStatement(parsedObj,currLocal) {
    let condition=  parseExpression(parsedObj.test);
    pushLineToQ(line,'else if statement','',condition,'');
    linesToRemove.set(line,false);
    line++;
    let body =parsedObj.consequent;
    let currMap=new Map(currLocal);
    // findType((body));
    findBodyType(body,true,currMap);
    editJason(parsedObj.test,currMap);
    if(parsedObj.alternate) {
        if (parsedObj.alternate.type == 'IfStatement')
            elseIfStatement(parsedObj.alternate);
        else/* if (parsedObj.alternate.type != 'IfStatement')*/ elseStatement(parsedObj.alternate,currMap);
    }
}

function elseStatement(parsedObj,currLocal) {
    pushLineToQ(line,'else statement','','','');
    linesToRemove.set(line,false);
    line++;
    //findType((parsedObj));
    //findType((parsedObj));
    let currMap=new Map(currLocal);
    findBodyType(parsedObj,true,currMap);
}

/*function forStatement(parsedObj) {
    let part1,part2,part3;
    if (parsedObj.init.type == 'AssignmentExpression') {
        let name = parsedObj.init.left.name; let right = parsedObj.init.right;
        right = parseExpression(right); part1 = name+''+parsedObj.init.operator+''+right; }
    else /*if (parsedObj.init.type == 'VariableDeclaration'){
      /*  let name = parsedObj.init.declarations[0].id.name; let right = parsedObj.init.declarations[0].init;
        right = parseExpression(right); part1 = name + '=' + right; }
    part2= parseExpression(parsedObj.test);
    if(parsedObj.update.type=='UpdateExpression'){
        let name = parsedObj.update.argument.name; let op = parsedObj.update.operator; part3=name+''+op; }
    else/*if(parsedObj.update.type=='AssignmentExpression'){
       /* let name = parsedObj.update.left.name; let right = parsedObj.update.right;
        right = parseExpression(right); part3=name+''+parsedObj.update.operator+''+right; }
    let condition=part1+';'+part2+';'+part3; pushLineToQ(line,'for statement','',condition,'');
    line++;
    //  currMap=new Map(localMap);
    // findBodyType(parsedObj.body,true);
}*/

function WhileStatement(parsedObj,currLocal) {
    let condition = parseExpression(parsedObj.test);
    pushLineToQ(line, 'while statement', '', condition, '');
    linesToRemove.set(line,false);
    line++;
    let currMap=new Map(currLocal);
    findBodyType(parsedObj.body,true,currMap);
    editJason(parsedObj.test,currMap);
}
function VariableDeclaration (parsedObj,inScope,currMap){
    let val;
    for(let i=0;i<parsedObj.declarations.length; i++) {
        let VC = parsedObj.declarations[i];
        if(VC.init) {
            val = parseExpression(VC.init);
            if(startFunc)
            {
                let rightToAdd =val; let newVar=replaceLocals(rightToAdd,currMap);
                if(inScope) {currMap.set(VC.id.name,newVar);   editJason(VC.init,currMap);}
                else{ localMap.set(VC.id.name,newVar);   editJason(VC.init,localMap);}
                linesToRemove.set(line,true);
            }
            else { globalMap.set(VC.id.name,val); linesToRemove.set(line,false);}
        } else { val=''; }
        pushLineToQ(line, 'variable declaration', VC.id.name,'',val);
    }
    line++;
}

function ExpressionStatement (parsedObj,inScope,currMap) {
    if (parsedObj.expression.type == 'AssignmentExpression') {
        let left = parsedObj.expression.left;let rightObj = parsedObj.expression.right; let right = parseExpression(rightObj);let name = parseExpression(left);
        pushLineToQ(line, 'assignment expression', name, '', right);
        if (startFunc) {
            let rightToAdd = right;
            let newVar = replaceLocals(rightToAdd, currMap);
            if (inScope) {
                editJason(rightObj, currMap);
                currMap.set(name, newVar);
            }
            else { editJason(rightObj, localMap);localMap.set(name, newVar); }
            linesToRemove.set(line,true);}
        else { globalMap.set(name, right);  linesToRemove.set(line,false);
        }}     line++;
    /*   else/* if(parsedObj.expression.type=='UpdateExpression') {
            let name = parsedObj.expression.argument.name;
            let op = parsedObj.expression.operator;
            pushLineToQ(line,'update expression',name,'',name+''+op);     }*/
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
    else/* if(exp.type=='Literal')*/ {
        return exp.value;
    }
    /* else if(exp.type=='UnaryExpression')
        return exp.operator+''+exp.argument.value;

    else/*if(exp.type=='MemberExpression'){*/
    /*  if(exp.property.name=='length'){
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
    return leftExp + ' ' + binary.operator + ' ' + rigthExp;
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

function replaceLocals(parsedObj,currLocal) {
    let newArr=parsedObj;
    let oldArr =parsedObj;
    if(parsedObj.length>1) {
        newArr = parsedObj.split(/[\s<>,=()*/;{}%+-]+/).filter(s => s !== '');
        oldArr = parsedObj.split(/[\s<>,=()*/;{}%+-]+/).filter(s => s !== '');
    }
    for(let i=0; i<newArr.length; i++) {
        if(currLocal.get(newArr[i])!==undefined){
            newArr[i]=currLocal.get(newArr[i]);
        }
    }
    var right=parsedObj;
    for(let i=0; i<newArr.length; i++) {
        right=right.replace(oldArr[i],newArr[i]);
    }
    return right;
}

function AddToMapFunctionDeclaration(parsedJsonCode) {
    for(let i=0; i<parsedJsonCode.params.length; i++) {// if(globalMap.get(parsedJsonCode.params[i].name===undefined)){
        globalMap.set(parsedJsonCode.params[i].name,parsedJsonCode.params[i].name);//   }
    }
}

function editBinaryJason(parsedObj,currMap){
    let left = parsedObj.left;
    let right =parsedObj.right;

    if (left.type == ('BinaryExpression'))
        editBinaryJason(left,currMap);
    else if (left.type == 'Identifier') {
        replaceJason(left,currMap); }

    if (right.type == ('BinaryExpression'))
        editBinaryJason(right,currMap);
    else if(right.type=='Identifier'){
        replaceJason(right,currMap);}

}

function editJason(parsedObj,currMap){
    if(parsedObj.type=='BinaryExpression')
        editBinaryJason(parsedObj,currMap);
    else if (parsedObj.type=='Identifier')
        replaceJason(parsedObj,currMap);
}
function replaceJason(jason,currMap){
    let name = jason.name;
    if (currMap.get(name)!==undefined){
        jason.name=currMap.get(name);
    }
}

function setParams(params){
    let array=params.split(/[\s<>,=]+/).filter(s => s !== '');
    paramsArray= new Map();
    for(let i=0; i<array.length;i=i+2){
        paramsArray.set(array[i],array[i+1]);
    }
}
function setColors(CodeLine,currLine){
    let line=CodeLine.split(/[\s<>,if=()*/;{}%+-]+/).filter(s => s !== '');
    let lineToCheck = CodeLine;
    for(let i=0; i<line.length;i++) {
        if(paramsArray.get(line[i])!==undefined)
            lineToCheck = lineToCheck.replace(line[i], paramsArray.get(line[i]));
    }
    lineToCheck=lineToCheck.replace('if','');
    lineToCheck=lineToCheck.replace('else','');
    lineToCheck=lineToCheck.replace('{','');
    lineToCheck=lineToCheck.replace('}','');
    if(eval(lineToCheck))
        colorMap.set(currLine,'green');
    else    colorMap.set(currLine,'red');
}