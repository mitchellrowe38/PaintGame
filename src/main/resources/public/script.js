//game window?
const game = document.getElementById("game");
const ctx = game.getContext("2d");
game.width=1200;
game.height=600;
ctx.fillStyle ="white";
const mapwidth=9600
const mapheight=4800

const camwidth=1200;
const camheight=600;

//homeScreen
const homeScreen = document.getElementById("homeScreen");
const nameInput = document.getElementById("nameInput");
const playButton = document.getElementById("playButton");



playButton.addEventListener("click",()=>{
player.name=nameInput.value.trim()||"null";
homeScreen.style.display="none";
});

//map
const mapTiles= {}
function key(a,b){return(a+","+b);}



//player
const player = {x:mapwidth/2,y:mapheight/2,speed:1.5,size:16,color:"white",id:null,name:"placeholder"};
let otherPlayers=[];

//server
const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(wsProtocol + "//" + location.host + "/game");
socket.addEventListener("message",(e)=>{
    const msg = JSON.parse(e.data);

    if(msg.type=="id"){
        player.id=msg.id;
        console.log("my id is: "+msg.id);
    }
    else if(msg.type=="fullmap"){
        for(const k in msg.tiles){
            mapTiles[k]=msg.tiles[k];
        }
    }
    else if(msg.type=="paint"){
        mapTiles[msg.tile]=msg.color;
    }
    else if(msg.type=="positions"){
        otherPlayers=msg.players;
    }
});

const cellWidth=18;
const cellHeight=18;
const padding=1;

var camx=mapwidth/2;
var camy=mapheight/2;

//key inputs
const keys = {};
window.addEventListener("keydown",(e) => {
if(e.key===" "){e.preventDefault();}
keys[e.key.toLowerCase()]=true;})
window.addEventListener("keyup",(e) => {keys[e.key.toLowerCase()]=false;})

//buttons
const redButton=document.getElementById("redButton");
const blueButton=document.getElementById("blueButton");
const yellowButton=document.getElementById("yellowButton");
const greenButton=document.getElementById("greenButton");
const blackButton=document.getElementById("blackButton");
const whiteButton=document.getElementById("whiteButton");
const colorPicker=document.getElementById("colorPicker");

redButton.addEventListener("click",() =>{player.color="red"; redButton.blur();})
blueButton.addEventListener("click",() =>{player.color="blue"; blueButton.blur();})
greenButton.addEventListener("click",() =>{player.color="green";greenButton.blur();})
yellowButton.addEventListener("click",() =>{player.color="yellow";yellowButton.blur();})
blackButton.addEventListener("click",() =>{player.color="black";blackButton.blur();})
whiteButton.addEventListener("click",() =>{player.color="white";whiteButton.blur();})
colorPicker.addEventListener("input",()=>{player.color=colorPicker.value;colorPicker.blur();})


//keybinds
function update(dt){
    const speed = keys["shift"] ? 300 : 100;   // pixels per SECOND

    if(keys["w"]==true){if(player.y>0){player.y-=speed*dt;}}
    if(keys["s"]==true){if(player.y<mapheight-20){player.y+=speed*dt;}}
    if(keys["a"]==true){if(player.x>0){player.x-=speed*dt;}}
    if(keys["d"]==true){if(player.x<mapwidth-20){player.x+=speed*dt;}}

    if(keys[" "]==true){
        socket.send(JSON.stringify({
            type: "paint",
            tile: key(Math.floor((player.x+9)/20), Math.floor((player.y+9)/20)),
            color: player.color,
            name: player.name
        }));
    }

    if(keys["q"]==true){player.color=mapTiles[key(Math.floor((player.x+9)/20),Math.floor((player.y+9)/20))] || "white";}

    camx=Math.floor(player.x-camwidth/2);
    camy=Math.floor(player.y-camheight/2);
}
//game loop
let lastTime = performance.now();

function loop() {
  const now = performance.now();
  const dt = (now - lastTime) / 1000;   // seconds since last frame
  lastTime = now;

  if (keys["m"]) {
    drawMap();              // fullscreen minimap, game frozen
  } else {
    update(dt);            // pass dt into update
    draw();
    drawPlayers();
  }
  requestAnimationFrame(loop);
}

loop();




function draw(){
ctx.fillStyle="black";
ctx.fillRect(0,0,camwidth,camheight);
for(let i =Math.floor(camx/20)-20;i<Math.floor((camx+1250)/20);i++){
    for(let j =Math.floor(camy/20)-20;j<Math.floor((camy+650)/20)+20;j++){
    ctx.fillStyle = mapTiles[key(i,j)] || "white";
    ctx.fillRect((20*i)-camx,(20*j)-camy,19,19);
    }
}
//draws the player (not anyone else)
ctx.strokeStyle="black";
ctx.fillStyle=player.color;
ctx.fillRect(player.x-camx,player.y-camy,player.size,player.size);
ctx.strokeRect(player.x-camx,player.y-camy,player.size,player.size);
ctx.font = "12px monospace";
ctx.textAlign = "center";
ctx.lineWidth = 4;
ctx.strokeStyle = "white";
ctx.fillStyle = "black";
const nx = (player.x - camx) + player.size/2;
const ny = (player.y - camy) - 6;
ctx.strokeText(player.name || "anon", nx, ny);   // stroke first
ctx.fillText(player.name || "anon", nx, ny);     // fill second
ctx.lineWidth=1;
}

function drawMap(){
ctx.fillStyle="black";
ctx.fillRect(0,0,camwidth,camheight);
for(let i=0;i<mapwidth/20;i++){
    for(let j=0;j<mapheight/20;j++){
    ctx.fillStyle=mapTiles[key(i,j)]||"white";
    ctx.fillRect(i*20*0.125,j*20*0.125,5,5);
    }
}
//mini players
for(const p of otherPlayers){
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x*0.125,p.y*0.125,5.5,5.5);
    //name
    ctx.font="6px monospace"
    ctx.lineWidth=2;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.strokeText(p.name || "anon", p.x*0.125+0.5, p.y*0.125-2);   // stroke FIRST
    ctx.fillText(p.name || "anon", p.x*0.125+0.5 , p.y*0.125-2);     // fill SECOND
    ctx.lineWidth=1;


}
}

function drawPlayers() {
    for (const p of otherPlayers) {
        if (p.id === player.id) continue;


        const screenX = p.x - camx;
        const screenY = p.y - camy;


        if (screenX < -20 || screenX > camwidth || screenY < -20 || screenY > camheight) continue;

        ctx.fillStyle = p.color;
        ctx.fillRect(screenX, screenY, player.size, player.size);
        ctx.strokeStyle = "black";
        ctx.strokeRect(screenX, screenY, player.size, player.size);

        //names
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "black";
        ctx.strokeText(p.name || "anon", screenX + player.size/2, screenY - 6);   // stroke FIRST
        ctx.fillText(p.name || "anon", screenX + player.size/2, screenY - 6);     // fill SECOND
        ctx.lineWidth=1;
    }

}

//send data to server
setInterval(()=>{
if(socket.readyState===WebSocket.OPEN)
{
    socket.send(JSON.stringify({type: "position",
    x: player.x,
    y: player.y,
    color: player.color,
    name: player.name
    }));
}
},50);
