import * as esgraph from 'esgraph';
export {executeCFG};
import * as esprima from 'esprima';

let typesMap;
let currGraph;
let stop;
let endNode;
function executeCFG(parsedObj, sourceCode) {
    setParams();
    let graph=esgraph(parsedObj.body[0].body);
    graph=esgraph.dot(graph,{counter:0, source:sourceCode });
    currGraph=graph.split('\n');
    generateNewGraph();
    let graphString='';
    for(let i=0;i<currGraph.length;i++){
        graphString+=currGraph[i]+'\n';
    }
    return graphString;
}
function setParams() {
    stop=false;
    currGraph=[];
    typesMap=new Map();
    insertToTypesMap();
}


function deleteLine(index, howmany){
    currGraph.splice(index, howmany);
}
function findEntryOrExitOrException(i) {
    let label=currGraph[i];
    if(label.includes('n0 ') || label.includes(endNode) || findLabel(label)== 'exception')
        return true;
    else
        return false;
}

function removeRest() {
    for (let i = 0; i < currGraph.length; i++) {
        if (findEntryOrExitOrException(i) ) {
            deleteLine(i, 1);
            i--;
        }
    }
}
function addNodesNumbers() {
    for(let i=0;i<currGraph.length;i++){
        if(currGraph[i].includes(' -> '))
            break;
        let label=findLabel(currGraph[i]);
        currGraph[i]=currGraph[i].substring(0,currGraph[i].indexOf('label=')+7)+'('+(i+1)+')\n'+label+'"'+currGraph[i].substring(currGraph[i].indexOf(','));
    }
}

function generateNewGraph() {
    for(let i=1; i<currGraph.length && !stop; i++){
        execTypeFunction(i);
    }
    removeRest();
    addNodesNumbers();
}

function getLineType(line) {
    if (line.includes('let ')) {
        return 'VariableDeclaration';
    } else if (findLabel(line) == 'exit') {
        return 'exit';
    } else if (line.includes('return ')) {
        return 'ReturnStatement';
    } else {
        return findComplexType(line);
    }
}

function findComplexType(line) {
    let x = esprima.parseScript(findLabel(line));
    let xType =(x.body)[0].expression.type;
    return xType;
}
function insertToTypesMap() {
    typesMap.set('AssignmentExpression', 'regularStatement');
    typesMap.set('VariableDeclaration', 'regularStatement');
    typesMap.set('UpdateExpression', 'regularStatement');
    typesMap.set('ReturnStatement', 'regularStatement');
    typesMap.set('condition', 'conditionStatement');
    typesMap.set('WhileStatement', 'conditionStatement');
    typesMap.set('if statement', 'conditionStatement');
    typesMap.set('BinaryExpression', 'conditionStatement');
    typesMap.set('LogicalExpression', 'conditionStatement');
    typesMap.set('exit', 'finishStatement');
}

function execTypeFunction(i){
    let type=getLineType(currGraph[i]);
    let func = typesMap.get(type);
    if(func =='regularStatement') regularStatement(i);
    else if (func =='conditionStatement') conditionStatement(i);
    else finishStatement(i);
}

//**

function findLabel(line) {
    let index1=line.indexOf('label="')+7;
    let index2=line.indexOf('"]');
    let index3=line.indexOf('",');
    let label;
    if(index3!==-1 && index3>index1)
        label= line.substring(index1,index3);
    else
        label= line.substring(index1,index2);
    return label;
}

function conditionStatement(i) {
    currGraph[i]=currGraph[i].substring(0,currGraph[i].indexOf(']'))+', shape = "diamond"]';
}

function findLet(i){
    if (findLabel(currGraph[i]).substring(0,4) == 'let ') {
        removeLet(i);
    }
    else return;
}

function removeLet(i){
    currGraph[i] = currGraph[i].replace(findLabel(currGraph[i]), findLabel(currGraph[i]).substring(4));
}

function regularStatement(i) {
    findLet(i);
    currGraph[i]=currGraph[i].substring(0,currGraph[i].indexOf(']'))+', shape = "box"]';
}

function finishStatement(i){
    endNode=currGraph[i].substring(0,currGraph[i].indexOf('['));
    deleteLine(i, 1);
    stop=true;
}
