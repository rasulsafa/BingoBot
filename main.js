const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
var PImage = require('pureimage');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

var bingoBoard;
fs.writeFile("./data.bingo", 0, {
    flag: 'wx'
}, function(err) {
    fs.readFile('./data.bingo', "utf8", function read(err, data) {
        bingoBoard = parseInt(data);
    });
});

client.on('message', msg => {
    if (msg.content.startsWith("$illorum show")) {
        showBoard(bitboardToArr(bingoBoard), msg);
    }
    else if (msg.content.startsWith("$illorum reset")) {
        if(msg.member.user.tag === "Illorum#9980") {
            msg.channel.send("The board was reset.");
            bingoBoard = 0;
            fs.writeFile("./data.bingo", bingoBoard, "utf-8", function(err){});
        }
        else msg.reply("only Illorum can reset the board manually");
    }
    else if (msg.content.startsWith("$illorum")) {
        if (msg.member.roles.find(r => r.name === "bingo" || msg.member.user.tag === "Illorum#9980")) {
            var args = msg.content.split(" ");
            var row = args[1],
                col = args[2];
            if (args.length == 3 && !isNaN(row) && !isNaN(col)) {
                row = parseInt(row), col = parseInt(col);
                if (row <= 5 && col <= 5 && col > 0 && row > 0) {
                    var mask = 1 << (row-1)*5+col-1;
                    //msg.channel.send("Current integer representation of board: " + bingoBoard);
                    if((bingoBoard & mask) == 0) {
                        //msg.channel.send("Bitwise operation performed: (" + bingoBoard + " |  (1 << " + mask +"))");
                        bingoBoard |= mask;
                        //msg.channel.send("New value: " + bingoBoard);
                        var boardArr = bitboardToArr(bingoBoard);
                        if(checkBingo(boardArr)) {
                            msg.channel.send("Bingo!\nFinal Board:");
                            showBoard(boardArr, msg);
                            bingoBoard = 0;
                            msg.channel.send("Congratulations on your bingo. Your reward is watching me suffer: https://www.youtube.com/watch?v=_MBS9UN1uoo");
                        }
                        else
                            showBoard(boardArr, msg);
                        fs.writeFile("./data.bingo", bingoBoard, "utf-8", function(err){});
                    }
                    else msg.reply("he already said that smh");
                } 
                else msg.reply("u way out of bounds rows and cols are from 1-5");
            } 
            else msg.reply("the command goes like `$illorum <row> <col>` where row and col are ints");
        } 
        else msg.reply("shut up bitch you dont have the bingo role smh");
    }
});
function bitboardToArr(bingoBoard) {
    var boardArr = [];
    var row = [];
    for(var i = 0; i < 25; i++) {
        if ((bingoBoard & (1 << i)) != 0)
            row.push(true);
        else row.push(false);
        if((i+1) % 5 == 0) {
            boardArr.push(row.slice());
            row = []
        }
    }
    return boardArr;
}
function showBoard(boardArr, msg) {
    var circleRadius = 30;
    var titleBarOffset = 42;
    PImage.decodeJPEGFromStream(fs.createReadStream("base.jpg")).then((img) => {
        var c = img.getContext('2d');
        for(var i = 0; i < 5; i++) {
            for(var j = 0; j < 5; j++) {
                if(boardArr[i][j]) {
                    c.fillStyle = "rgba(255, 0, 0, 0.5)";
                    c.beginPath();
                    c.arc(j*(img.width/5)+(img.width/10), i*((img.height-titleBarOffset)/5)+((img.height-titleBarOffset)/10)+titleBarOffset, circleRadius, 0,Math.PI*2,true);
                    c.closePath();
                    c.fill();
                }
            }
        }
        PImage.encodeJPEGToStream(img,fs.createWriteStream("./bingo-current.jpg")).then(() => { 
            msg.channel.send("", {files: ["./bingo-current.jpg"]});
        });
    });
}
function checkBingo(boardArr) {
    var horizontal = 0, vertical = 0, diag1 = 0, diag2 = 0;
    for(var i = 0; i < 5; i++) {
        for(var j = 0; j < 5; j++) {
            if(boardArr[i][j])
                horizontal++;
            if(boardArr[j][i])
                vertical++;
        }
        if(horizontal == 5 || vertical == 5)
            return true;
        
        if(boardArr[i][i]) diag1++;
        if(boardArr[i][4-i]) diag2++;
        
        horizontal = 0, vertical = 0;
    }
    return diag1 == 5 || diag2 == 5;
}


client.login('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

client.on('error', (err) => {
   console.log(err.message)
});
