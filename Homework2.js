/*  HW2 
        Lorenzi Flavio
              */

"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var colorsArray = [];

var texCoordsArray = [];

var texBig = 256;
var nCheck = 8;
var topT, downT;
var b;
var yTorso = -1.5;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

//vertexCol ridimensionato ad un solo colore! ! ! !
var colore = [
    vec4(0.65, 0.43, 0.21, 1.0),  // marrone utilizzato
    vec4(0, 0, 0, 1.0),  //nero
    vec4(0.7, 0.5, 0.4, 1) //marrone chiaro
];


//inizialiazzo nodi ID
var bustoId = 0;  //torso
var cranioId  = 1; //head
var cranio1Id = 1; 
var cranio2Id = 11;
var gambaSxFrontId = 2;   //leftUarm
var zampaSxFrontId = 3; //leftLarm
var gambaDxFrontId = 4;//rightUarm
var zampaDxFrontId = 5;//rightLarm
var gambaSxBackId = 6; //leftUleg
var zampaSxBackId = 7; //leftLleg
var gambaDxBackId = 8;//rightUleg
var zampaDxBackId = 9;//rightLleg
var codinaId = 10;      //tailAggiunta

//id ostacolii per il punto3" ! !
var obsMainId = 12;
var obsSxId = 13;
var obsDxId = 14;
var obsCenterId = 15;
var obsCenter2Id = 16;


var bustoHeight = 4.9;
var bustoWidth = 1.7;

var gambeFrontHeight = 2.5;
var zampeFrontHeight = 0.4;
var gambeFrontWidth  = 0.5;
var zampeFrontWidth  = 0.4;

var gambeBackWidth  = 0.5;
var zampeBackWidth  = 0.4;
var zampeBackHeight = 0.4;
var gambeBackHeight = 2.5;

var cranioHeight = 2.0;
var cranioWidth = 1.0;

var codinaHeight = 1.5;
var codinaWidth = 0.3;

//grandezze ostacoli per il punto3"! ! 
var obsMainHeight = 0.4;
var obsMainWidth = 0.9;
var obsSxHeight = 8.5;
var obsSxWidth = 0.7;
var obsDxHeight = 8.5;
var obsDxWidth = 0.7;
var obsCenterHeight = 8.2;
var obsCenterWidth = 0.7;
var obsCenter2Height = 8.2;
var obsCenter2Width = 0.7;

var numeNodi = 17;


//var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0];
/* In ordine dentro theta abbiamo:
  torso,testa,
  gamba avanti sx, piede av sx, gamba avanti dx ,piede av sx,
  stessa cosa con quelli dietro,
  coda,  testa2,
  obsMain, obsSx, obsDx, obsCenter, obsCenter2.
    
*/
var theta = [90, -140,    100,20, 85, 20,     100, 20, 85, 20,    120, 90,    90,90,90,90,90 ];

//flag per il via
var goFlag321 = false;

var distanceFromOb = 0;  //DISTANZA DALL'OSTACOLO ---> dovrà arrivare a -18 per il salto

//utilizzati per aumentare/diminuire ogni volta i valori di theta delle gambe e della coda
//per consentire l'intervallo di movimento
var uPgambaSxFront = -0.3   //incr. per le velocita' delle gambe da -tot a +tot
var uPgambaDxFront = 0.3
var uPgambaSxBack = -0.3
var uPgambaDxBack = 0.3
var upCodina = 0.3;




var stack = [];

var figure = [];

for( var i=0; i<numeNodi; i++) figure[i] = createNode(null, null, null, null);

var modelViewLoc;
var pointsArray = [];

//proced. texture con le due image per la checkboard
//presa dal codice sorgente del cubeTex sul sito

var image1 = new Uint8Array(4 * texBig * texBig);
for (var i = 0; i < texBig; i++) {
    for (var j = 0; j < texBig; j++) {
        var patchx = Math.floor(i / (texBig / nCheck));
        var patchy = Math.floor(j / (texBig / nCheck));
        if (patchx % 2 ^ patchy % 2) b = 255;
        else b = 0;
        image1[4 * i * texBig + 4 * j] = b;
        image1[4 * i * texBig + 4 * j + 1] = b;
        image1[4 * i * texBig + 4 * j + 2] = b;
        image1[4 * i * texBig + 4 * j + 3] = 255;
    }
}
var image2 = new Uint8Array(4 * texBig * texBig);
for (var i = 0; i < texBig; i++) {
    for (var j = 0; j < texBig; j++) {
        //ciò che è richiesto al punto 2: sfumatura della texture da intenso a meno intenso
        b = 210 - j / 1.3;
        //impostaz. colore
        image2[4 * i * texBig + 4 * j] = b;
        image2[4 * i * texBig + 4 * j + 1] = b;
        image2[4 * i * texBig + 4 * j + 2] = b;
        image2[4 * i * texBig + 4 * j + 3] = 255;
    }
}



//nella funzione quad vado a inserire il push del marrone dentro colorsArray
function quad(a,b,c,d) {
    pointsArray.push(vertices[a]);
    colorsArray.push(colore[0]);
    texCoordsArray.push(texCoord[0]);
 
    pointsArray.push(vertices[b]);
    colorsArray.push(colore[0]);
    texCoordsArray.push(texCoord[1]);
 
    pointsArray.push(vertices[c]);
    colorsArray.push(colore[0]);
    texCoordsArray.push(texCoord[2]);
 
    pointsArray.push(vertices[d]);
    colorsArray.push(colore[0]);
    texCoordsArray.push(texCoord[3]);
 
}

//richiesta per la linear decrease! ! ! 
function facciaNera(a,b,c,d){
    pointsArray.push(vertices[a]);
    colorsArray.push(colore[1]);
    texCoordsArray.push(texCoord[3]);
 
    pointsArray.push(vertices[b]);
    colorsArray.push(colore[1]);
    texCoordsArray.push(texCoord[2]);
 
    pointsArray.push(vertices[c]);
    colorsArray.push(colore[1]);
    texCoordsArray.push(texCoord[1]);
 
    pointsArray.push(vertices[d]);
    colorsArray.push(colore[1]);
    texCoordsArray.push(texCoord[0]);
}


/// 6 facciate per ogni object (cubo) ----> funzione modificata per le richieste sulla linear decrease
function cube() {
    quad(1, 0, 3, 2);  //parte sotto
    quad(2, 3, 7, 6);  //parte sx
    facciaNera(3, 0, 4, 7);  //fondoschiena -----> funzione che prende il colore nero come richiesto
    quad(2, 6, 5, 1);  //petto -----> modificata per una linear decrease dalla testa (nera) verso il basso
    quad(6, 7, 4, 5);  //parte sopra -----> modificata per avere la linear decrease da (4 5 6 7)
    quad(5, 4, 0, 1);  //parte dx
}


 
var texCoord = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(1, 1),
    vec2(0, 1)
];
 


//config. della texture

function fixTex() {
    topT = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, topT);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texBig, texBig, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    downT = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, downT);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texBig, texBig, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case bustoId:

    m = rotate(90, 0, 1, 0 );
    m = mult(m, translate(0, yTorso, distanceFromOb));  
    m = mult(m, rotate(theta[bustoId], 1, 0, 0));


    figure[bustoId] = createNode( m, busto, null, cranioId );

    break;

    case cranioId:
    case cranio1Id:
    case cranio2Id:


    m = translate(0.0, bustoHeight+1.5*cranioHeight, 0.0);
    m = mult(m, rotate(theta[cranio1Id], 1, 0, 0))
    m = mult(m, rotate(theta[cranio2Id], 0, 1, 0));
    m = mult(m, translate(0.0, cranioHeight/0.9, 0.0));

    figure[cranioId] = createNode( m, cranio, gambaSxFrontId, null);

    break;


    case gambaSxFrontId:

    m = translate(-(0.333*bustoWidth + gambeFrontWidth), 0.9*bustoHeight, 0.0);
    m = mult(m, rotate(theta[gambaSxFrontId], 1, 0, 0));
    figure[gambaSxFrontId] = createNode( m, gambaSxFront, gambaDxFrontId, zampaSxFrontId );
    break;

    case gambaDxFrontId:

    m = translate(0.333*bustoWidth +gambeFrontWidth, 0.9*bustoHeight, 0.0);
    m = mult(m, rotate(theta[gambaDxFrontId], 1, 0, 0));
    figure[gambaDxFrontId] = createNode( m, gambaDxFront, gambaSxBackId, zampaDxFrontId );
    break;

    case gambaSxBackId:

    m = translate(-(0.333*bustoWidth +gambeBackWidth), 0.1*gambeBackHeight, 0.0);
    m = mult(m , rotate(theta[gambaSxBackId], 1, 0, 0));
    figure[gambaSxBackId] = createNode( m, gambaSxBack, gambaDxBackId, zampaSxBackId );
    break;

    case gambaDxBackId:

    m = translate(0.333*bustoWidth + gambeBackWidth, 0.1*gambeBackHeight, 0.0);
    m = mult(m, rotate(theta[gambaDxBackId], 1, 0, 0));
    figure[gambaDxBackId] = createNode( m, gambaDxBack, codinaId, zampaDxBackId );
    break;

    case codinaId:

    m = translate(bustoWidth/20, - bustoHeight/20, -1);
    m = mult(m, rotate(theta[codinaId], 1, 0, 0));
    figure[codinaId] = createNode( m, codina, null, null);
    break;

    case zampaSxFrontId:

    m = translate(0.0, gambeFrontHeight, 0.0);
    m = mult(m, rotate(theta[zampaSxFrontId], 1, 0, 0));
    figure[zampaSxFrontId] = createNode( m, zampaSxFront, null, null );
    break;

    case zampaDxFrontId:

    m = translate(0.0, gambeFrontHeight, 0.0);
    m = mult(m, rotate(theta[zampaDxFrontId], 1, 0, 0));
    figure[zampaDxFrontId] = createNode( m, zampaDxFront, null, null );
    break;

    case zampaSxBackId:

    m = translate(0.0, gambeBackHeight, 0.0);
    m = mult(m, rotate(theta[zampaSxBackId ], 1, 0, 0));
    figure[zampaSxBackId] = createNode( m, zampaSxBack, null, null );
    break;

    case zampaDxBackId:

    m = translate(0.0, gambeBackHeight , 0.0);
    m = mult(m, rotate(theta[zampaDxBackId], 1, 0, 0));
    figure[zampaDxBackId] = createNode( m, zampaDxBack, null, null );
    break;



    //inizio creazione obstacle punto 3///

    case obsMainId:

    m = rotate(theta[obsMainId], 0, 1, 0 );
    m = mult(m, rotate(theta[obsMainId ], 1, 0, 0));
    m = mult(m, translate(0, 12, 2));
    figure[obsMainId] = createNode( m, obsMain, null, obsSxId );
    break;


    case obsSxId:

    m = rotate(theta[obsSxId], 1, 0, 0);
    m = mult(m, translate(4, -6, 0));
    figure[obsSxId] = createNode( m, obsSx, obsDxId, null);
    break;


    case obsDxId:

    m = rotate(theta[obsDxId], 0, 0, 1);
    m = mult(m, rotate(theta[obsMainId ], 1, 0, 0));
    m = mult(m, translate(0, -6, -4));

    figure[obsDxId] = createNode( m, obsDx, obsCenterId, null);
    break;

    case obsCenterId:

    m = rotate(theta[obsCenterId], 1, 0, 0);
    m = mult(m, rotate(theta[obsCenterId ], 0, 0, 1));
    m = mult(m, translate(0, -4, 0));

    figure[obsCenterId] = createNode( m, obsCenter, obsCenter2Id, null);
    break;

    case obsCenter2Id:

    m = rotate(theta[obsCenterId], 1, 0, 0);
    m = mult(m, rotate(theta[obsCenter2Id ], 0, 0, 1));
    m = mult(m, translate(2, -4, 0));

    figure[obsCenter2Id] = createNode( m, obsCenter2, null, null);
    break;
    
    }



}

function traverse(Id) {
   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function busto() {

    fixTex();
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5* bustoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( bustoWidth, bustoHeight, bustoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    gl.deleteTexture(downT);
}

function cranio() {
  
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * cranioHeight, 0.0 ));
  instanceMatrix = mult(instanceMatrix, scale4(cranioWidth, cranioHeight, cranioWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function gambaSxFront() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * gambeFrontHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(gambeFrontWidth, gambeFrontHeight, gambeFrontWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function zampaSxFront() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * zampeFrontHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(zampeFrontWidth, zampeFrontHeight, zampeFrontWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function gambaDxFront() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * gambeFrontHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(gambeFrontWidth, gambeFrontHeight, gambeFrontWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}



function  gambaSxBack() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * gambeBackHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(gambeBackWidth, gambeBackHeight, gambeBackWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}


//Creazione della "tail" richiesta nel punto 1.
function codina() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * codinaHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(codinaWidth, codinaHeight, codinaWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    
}
function zampaDxFront() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * zampeFrontHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(zampeFrontWidth, zampeFrontHeight, zampeFrontWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function zampaSxBack() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * zampeBackHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(zampeBackWidth, zampeBackHeight, zampeBackWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function gambaDxBack() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * gambeBackHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(gambeBackWidth, gambeBackHeight, gambeBackWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    
}


function zampaDxBack() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * zampeBackHeight, 0.0) );
     instanceMatrix = mult(instanceMatrix, scale4(zampeBackWidth, zampeBackHeight, zampeBackWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    
}

//Inizio punto3 - - - - - - - - - 

function obsMain() {
    //fixTex(); //texture anche sull'ostacolo, per garantire una migliore visibilità
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * obsMainHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(obsMainWidth, obsMainHeight, obsMainWidth) )
      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function obsSx() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * obsSxHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(obsSxWidth, obsSxHeight, obsSxWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function obsDx(){

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * obsDxHeight, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale4(obsDxWidth, obsDxHeight, obsDxWidth) )
     gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function obsCenter(){


    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * obsCenterHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(obsCenterWidth, obsCenterHeight, obsCenterWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
function obsCenter2(){
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * obsCenter2Height, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(obsCenter2Width, obsCenter2Height, obsCenter2Width) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// - - - - - - - fine funzioni per l'ostacolo!


function avanti(){

}


//funzione di "va avanti e salta l'ostacolo" per il punto 4!! 

function go_Forward_And_Jump(){
    if(goFlag321 == true){

        //tre fasi per il salto
        if(distanceFromOb > 5  && distanceFromOb < 10.5){
            //jump
            theta[bustoId] -= 1.0;  //60 gradi
            yTorso += 0.1;
            theta[cranioId] -= 0.5;  //piega un po' la testa
            //piego le gambe indietro per renderlo piu' naturale
            theta[gambaSxFrontId] += 1;
            theta[gambaDxFrontId] += 1;
            theta[gambaSxBackId] += 1;
            theta[gambaDxBackId] += 1;

        }
        if(distanceFromOb > 10.4 && distanceFromOb < 15.4){
            //discesa
            theta[bustoId] += 1.0;  //120 gradi
            yTorso -= 0.1;
            theta[cranioId] += 0.5;
            theta[gambaSxFrontId] -= 1;
            theta[gambaDxFrontId] -= 1;
            theta[gambaSxBackId] -= 1;
            theta[gambaDxBackId] -= 1;
        }
        if(distanceFromOb >15.3 ){
            //return
            theta[bustoId] = 90
            yTorso = -1.5;
        }


        
        if(distanceFromOb < 25){ //per garantire lo stop

            //aumento la -distanceFromOb -----> che in realtà sarebbe la posizione del cavallo
            //NB stessa cosa poteva essere fatta diminuendo la vera distanza dell'ostacolo,
            // ovvero il secondo valore (pari a 12) di translate, dentro il mainObs
            distanceFromOb += 0.12

            /* Per ogni "pezzo" creo un intervallo di movimento dell'angolo */
            //per ognuno infatti c'è un upgrade che permette al valore di cambiare segno

            if(distanceFromOb < 5.5 || distanceFromOb > 15.4){ //per non far muovere le gambe durante il salto

                //gambaSxFront = 100
                theta[gambaSxFrontId] += uPgambaSxFront;
                if (theta[gambaSxFrontId] > 115)
                    uPgambaSxFront = -1.1*uPgambaSxFront;
                theta[gambaSxFrontId] += uPgambaSxFront;
                if (theta[gambaSxFrontId] < 85)
                    uPgambaSxFront = -1.1*uPgambaSxFront;

                //gambaDxFront = 85
                theta[gambaDxFrontId] += uPgambaDxFront;
                if (theta[gambaDxFrontId] > 100)
                    uPgambaDxFront = -1.1*uPgambaDxFront;
                theta[gambaDxFrontId] += uPgambaDxFront;
                if (theta[gambaDxFrontId] < 70)
                    uPgambaDxFront = -1.1*uPgambaDxFront;

                //100
                theta[gambaSxBackId] += uPgambaSxBack;
                if (theta[gambaSxBackId] > 115)
                    uPgambaSxBack = -1.1*uPgambaSxBack;
                theta[gambaSxBackId] += uPgambaSxBack;
                if (theta[gambaSxBackId] < 85)
                    uPgambaSxBack = -1.1*uPgambaSxBack;

                //85
                theta[gambaDxBackId] += uPgambaDxBack;
                if (theta[gambaDxBackId] > 100)
                    uPgambaDxBack = -1.1*uPgambaDxBack;
                theta[gambaDxBackId] += uPgambaDxBack;
                if (theta[gambaDxBackId] < 70)
                    uPgambaDxBack = -1.1*uPgambaDxBack;
                
                //muoviAncheLaCoda
                theta[codinaId] = theta[codinaId] + upCodina;
                if (theta[codinaId] > 130)
                  upCodina = -1.1*upCodina;
                theta[codinaId] = theta[codinaId] + upCodina;
                if (theta[codinaId] < 100)
                  upCodina = -1.1*upCodina;
                
            }

        }
    }

}





window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( -100, 150, canvas.width, canvas.height );  //modificato per averlo al centro e piu su
    gl.clearColor( 0.26, 0.51, 0.22, 0.5 );

    //per aggiungere le pareti trasparenti/mancanti! ! !  !.
    gl.enable(gl.DEPTH_TEST);



    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();
    

    projectionMatrix = ortho(-19,19,-19, 19,-200,200); //left, right, bottom, top, near, far
    modelViewMatrix = mat4();
    //Per aggiungere un po di prospettiva alla corsa del cavallo
    modelViewMatrix = mult(modelViewMatrix , rotateY(-60));


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    
    //zona buffer !! !
 
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
 
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //inizializzo i nuovi buffers

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
 
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
 
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    //NB buffer per la texture
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);


    //richiamo texture.
    fixTex();
    // e attivazione
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, topT);
    gl.uniform1i(gl.getUniformLocation(program, "Top"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, downT);
    gl.uniform1i(gl.getUniformLocation(program, "Down"), 1);




    //-------------------
            //Centro di controllo (buttons)

    //button per il movimento
    document.getElementById("Go").onclick = function(){
        goFlag321 =! goFlag321;
    };
    //button per la rotaz.
    document.getElementById("Rotation").onclick = function(){
        modelViewMatrix = mult(modelViewMatrix , rotateY(15));
    };
    document.getElementById("Rotation2").onclick = function(){
        modelViewMatrix = mult(modelViewMatrix , rotateX(15));
    };
    //-------------------




     
    for(i=0; i<numeNodi; i++) initNodes(i);

    render();
}





var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    //Richiamo della funzione per il punto 4
    //NB: Il cavallo deve muoversi in avanti, saltare l'ostacolo e cadere in piedi dall'altra parte! ! ! 
    go_Forward_And_Jump();
    for(i=0; i<numeNodi; i++) initNodes(i);
    
    traverse(obsMainId);
    traverse(bustoId);
    requestAnimFrame(render);
}




//-------------------
//NB altro modo per fare il salto: telecamera fissa sul cavallo, non sull'ostacolo
//diminuisci la distanza dall'ostacolo invece che aumentare la position del cavallo!!!
/* if(trueDistance > 2  && trueDistance < 6){
            //jump
            theta[bustoId] -= 1;  //60 gradi
            yTorso += 0.1;
            theta[cranioId] -= 0.5;  //piega un po la testa
        }
        if(trueDistance > -2.1 && trueDistance < 1.9){
            //discesa
            theta[bustoId] += 1;  //120 gradi
            yTorso -= 0.1;
            theta[cranioId] += 0.5;
        }
        if(trueDistance < -6.1 ){
            //return
            theta[bustoId] = 90
            yTorso = -1.5;
        }
        */
