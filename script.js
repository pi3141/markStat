var isPlotted = false;
function init(){
    if(localStorage.getItem('content_5')){
        document.getElementById('btn5').style.display='revert';
    }
    if(localStorage.getItem('content_4')){
        document.getElementById('btn4').style.display='revert';
    }
    if(localStorage.getItem('content_3')){
        document.getElementById('btn3').style.display='revert';
    }
}

function clearLS(){
    localStorage.clear();
    document.getElementById('btn5').style.display='none';
    document.getElementById('btn4').style.display='none';
    document.getElementById('btn3').style.display='none';
}

init();


function getData(){
    isPlotted=true;
    document.getElementById('btn5').style.display='revert';
    document.getElementById('btn4').style.display='revert';
    document.getElementById('btn3').style.display='revert';

    var bareme=document.getElementById('bareme').value;
    var data= document.getElementById('data').value.replaceAll(',','.');
    var title= document.getElementById('titleInput').value;
    var dataArray=[];
    var lines = data.split('\n');
    for(var i = 0;i < lines.length;i++){
        if (! lines[i].includes('élèves') && ! lines[i].includes('Moyenne')){
console.log(lines[i].split('\t').pop());
            val = parseFloat(lines[i].split('\t').pop(),10);
            
            if(! isNaN(val)){dataArray.push(val)};
        }
    } 
    console.log({dataArray});
    document.getElementById('inputs').style.display='none';
    document.getElementById('saveButtons').style.display='revert';
    draw(dataArray,bareme,title);
}

const asc = arr => arr.sort((a, b) => a - b);
const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};
const roundToTenth = a => Math.round(a*10)/10;


function draw(data,bareme,title){

//plot boxplot
q1=quantile(data,.25);
q2=quantile(data,.5);
q3=quantile(data,.75);

q1Norm=quantile(data,.25)/bareme * 10;
q2Norm=quantile(data,.5)/bareme * 10;
q3Norm=quantile(data,.75)/bareme * 10;


minVal=Math.min(...data);
maxVal=Math.max(...data);

minValNorm=Math.min(...data)/bareme * 10;
maxValNorm=Math.max(...data)/bareme *10;

iQNorm = q3Norm-q1Norm;

var tick;
for (let i = 0; i <= bareme; i++) {
    let xPos=i/bareme*10;
    tick += "<line class='graduation' x1='"+xPos+"' y1='0' x2='"+xPos+"' y2='5'/>";
    tick += "<text class='graduationTexte' x='"+xPos+"' y='4.8' font-size='.2'>"+i+"</text>"
}
var svgInner = "<defs><filter id='shadow'><feDropShadow dx='4' dy='8' stdDeviation='4'/></filter></defs><filter x='0' y='0' width='1' height='1' id='solid'><feFlood flood-color='#33f' result='bg' /><feMerge><feMergeNode in='bg'/><feMergeNode in='SourceGraphic'/></feMerge></filter>";

//zone vert/bleu/jaune/rouge
svgInner += "<path d='M "+minValNorm+" 0 v 5 H "+q1Norm+" v -5 H 0'  class='colouredArea red' />";
svgInner += "<path d='M "+q1Norm+" 0 v 5 H "+q2Norm+" v -5 H 0'  class='colouredArea yellow' />";
svgInner += "<path d='M "+q2Norm+" 0 v 5 H "+q3Norm+" v -5 H 0'  class='colouredArea blue' />";
svgInner += "<path d='M "+q3Norm+" 0 v 5 H "+maxValNorm+" v -5 H 0'  class='colouredArea green' />";

svgInner += "<g id='axis' style='stroke:rgb(50,50,50);stroke-width:.02'><line x1='0' y1='4' x2='10' y2='4'/>"+ tick +"</g>";

//plot points
var a;
var b = 1;

var findHeightForDot = (b) => (3-(.3*b));


asc(data).forEach( function(e) {
    let cx = e * 10 / bareme;
    if( a == e){
        svgInner += "<circle class='dot' cx='"+cx+"' cy='"+findHeightForDot(b)+"' r='.07'/>";
        b=b+.5;
    }else{
        b = .5;
        svgInner += "<circle class='dot' cx='"+cx+"' cy='3' r='.07'/>";
        a=e;
    };
});



//TODO LOOP over object

svgInner += "<line class='labelLine' x1='"+maxValNorm+"' y1='3' x2='"+maxValNorm+"' y2='1' />";
svgInner += "<path class='label' d='M "+maxValNorm+" 1.2 l 0.2 -0.1 h 0.2 v -1 h -.8 v 1 h .2 z' />";
svgInner += "<text class='labelText' x='"+maxValNorm+"' y='.4'><tspan font-size='.15px'>MAX</tspan><tspan x='"+maxValNorm+"' dy=.45px>"+roundToTenth(maxVal)+"</tspan></text>";

svgInner += "<line class='labelLine' x1='"+q3Norm+"' y1='3' x2='"+q3Norm+"' y2='1' />";
svgInner += "<path class='label' d='M "+q3Norm+" 1.2 l 0.2 -0.1 h 0.2 v -1 h -.8 v 1 h .2 z' />";
svgInner += "<text class='labelText' x='"+q3Norm+"' y='.4'><tspan font-size='.15px' >Q3</tspan><tspan x='"+q3Norm+"' dy=.45px>"+roundToTenth(q3)+"</tspan></text>";

svgInner += "<line class='labelLine' x1='"+q2Norm+"' y1='3' x2='"+q2Norm+"' y2='1' />";
svgInner += "<path class='label' d='M "+q2Norm+" 1.2 l 0.2 -0.1 h 0.25 v -1 h -.9 v 1 h .25 z' />";
svgInner += "<text class='labelText' x='"+q2Norm+"' y='.4'><tspan font-size='.15px' >MÉDIANE</tspan><tspan x='"+q2Norm+"' dy=.45px>"+roundToTenth(q2)+"</tspan></text>";

svgInner += "<line class='labelLine' x1='"+q1Norm+"' y1='3' x2='"+q1Norm+"' y2='1' />";
svgInner += "<path class='label' d='M "+q1Norm+" 1.2 l 0.2 -0.1 h 0.2 v -1 h -.8 v 1 h .2 z' />";
svgInner += "<text class='labelText' x='"+q1Norm+"' y='.4'><tspan font-size='.15px' >Q1</tspan><tspan x='"+q1Norm+"' dy=.45px>"+roundToTenth(q1)+"</tspan></text>";

svgInner += "<line class='labelLine' x1='"+minValNorm+"' y1='3' x2='"+minValNorm+"' y2='1' />";
svgInner += "<path class='label' d='M "+minValNorm+" 1.2 l 0.2 -0.1 h 0.2 v -1 h -.8 v 1 h .2 z' />";
svgInner += "<text class='labelText' x='"+minValNorm+"' y='.4'><tspan font-size='.15px' >MIN</tspan><tspan x='"+minValNorm+"' dy=.45px>"+roundToTenth(minVal)+"</tspan></text>";

//svgInner += "<path class='label' d='M "+maxVal+" 1 l 0.2 -0.1 h 0.3 v -0.5 h -1 v .5 h .3 z' />";

svgInner += "<rect class='boite' x='"+q1Norm+"' y='3.5' width='"+iQNorm+"' height='1' />";
svgInner += "<line class='moyenne' x1='"+q2Norm+"' y1='3.5' x2='"+q2Norm+"' y2='4.5' />";
svgInner += "<line class='moustache' x1='"+minValNorm+"' y1='4' x2='"+q1Norm+"' y2='4' />";
svgInner += "<line class='moustacheEnd' x1='"+minValNorm+"' y1='3.5' x2='"+minValNorm+"' y2='4.5' />";
svgInner += "<line class='moustache' x1='"+maxValNorm+"' y1='4' x2='"+q3Norm+"' y2='4' />";
svgInner += "<line class='moustacheEnd' x1='"+maxValNorm+"' y1='3.5' x2='"+maxValNorm+"' y2='4.5' />";





var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//    svg.setAttribute('style', 'border: 1px solid black');
    svg.setAttribute('width', '100%');
    //svg.setAttribute('height', '300');
    svg.setAttribute('viewBox','-1 0 12 5')
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.innerHTML=svgInner;
    document.getElementById('plot').appendChild(svg);
document.getElementById('title').innerHTML="<h1>"+title+"</h1>";
}

function lsIO(classNr){
    if (isPlotted == true){
        htmlPage=document.body.innerHTML
        localStorage.setItem("content_"+classNr, htmlPage);
    }else{
        document.body.innerHTML=localStorage['content_'+classNr];
    }
    document.getElementById('saveButtons').style.display='none';
}