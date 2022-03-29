
let koanNum = getCookie("koanNum");
if (koanNum === "") {
  koanNum = 1;
}
var targetHtml = ""
var asciidoctor = Asciidoctor();

function init(partNum) {
    console.log("init");
    //document.getElementById('input'+koanNum).focus();
    targetHtml = document.getElementById('target'+koanNum+'.'+partNum).innerHTML
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    return ""
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function getKoan() {
    fetch("workshop/koan_"+koanNum+".adoc")
        .then(function (response) {
            if (response.ok) {
                return response.text();
            } else {
                alert("HTTP-Error: " + response.status);
            }
        })
        .then(function (koan) {
            var content = document.getElementById('content');
            //content.innerHTML += document.getElementById('template').innerHTML.replaceAll('%%',koanNum)
            koanParts = koan.split("''''")
            let partNum = 0
            koanParts.forEach(function(part) {
                    part = part.split("'''");
                    content.insertAdjacentHTML("beforeend", document.getElementById('template').innerHTML.replaceAll('%%',koanNum+'.'+partNum));
                    let description = document.getElementById('description'+koanNum+'.'+partNum);
                    description.innerHTML = asciidoctor.convert(":imagesdir: images\n\n" + part[0], {to: 'html5'});
                    var target = document.getElementById('target'+koanNum+'.'+partNum);
                    target.innerHTML = asciidoctor.convert(part[1], {to: 'html5'});
                    var hint = document.getElementById('hint'+koanNum+'.'+partNum);
                    hint.innerHTML = asciidoctor.convert(":imagesdir: images\n\n" + part[2], {to: 'html5'});
                    var plain = document.getElementById('input'+koanNum+'.'+partNum);
                    plain.addEventListener('keyup', function(e) {
                        let regexp = new RegExp('^[a-z]+([0-9]+)[.]([0-9]+)$');
                        let match = regexp.exec(e.target.id);
                        console.log(e.target.id);
                        console.log(match);
                        convert(match[1], match[2]);
                    });
                    plain.addEventListener('input', autoResize, false);
                    plain.addEventListener('focusin', autoResize, false);
                    plain.style.height = 'auto';
                    plain.style.height = plain.scrollHeight + 'px';
                    plain.value = part[3];
                    init(partNum);
                    convert(koanNum, partNum);
                    partNum++;
            })
            content.insertAdjacentHTML("beforeend", document.getElementById('templateButton').innerHTML.replaceAll('%%',koanNum+'.'+partNum));
            countScore();
            window.setTimeout(function() {
                var descr = document.getElementById ('description'+koanNum+".0");
                console.log(descr);
                console.log(koanNum);
                descr.scrollIntoView ( true );
            },500);
        });
}
function convert(koanNum, partNum) {
    console.log(koanNum+" - "+partNum);
    var content = document.getElementById('input'+koanNum+'.'+partNum).value;
    var inputHtml = asciidoctor.convert(content, {to: 'html5'})
    //inputHtml = inputHtml.replaceAll('&#10063;','❏');
    document.getElementById('rendered'+koanNum+'.'+partNum).innerHTML = inputHtml;
    var rendered = document.getElementById('rendered'+koanNum+'.'+partNum)
    var targetHtml = document.getElementById('target'+koanNum+'.'+partNum).innerHTML;
//    let output = htmlDiff.execute(targetHtml, inputHtml);
//    rendered.innerHTML = output;
    if (targetHtml.trim() == inputHtml.trim()) {
        //correct
        rendered.style.borderColor = '#88ff88';
        rendered.classList.add("correct");
        countScore();

    } else {
        rendered.style.borderColor = '#ff8888';
        rendered.classList.remove("correct");
    }

};
function next() {
    koanNum++;
    setCookie("koanNum", koanNum, 365*10);
    getKoan();
}
function countScore() {
    var score = 0;
    var scores = "<table id='score' style='position: absolute; bottom: 2em;'>";
    var results = document.getElementsByClassName('rendered');
    let lastKoan = 0;
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        let regexp = new RegExp('^[a-z]+([0-9]+)[.]([0-9]+)$');
        let match = regexp.exec(result.id);
        if (match) {
            if (match[1] != lastKoan) {
                if (lastKoan != 0) {
                    scores += "</tr>"
                }
                scores += "<tr><td>"+match[1]+"</td>";
                lastKoan = match[1];
            }
            if (result.classList.contains('correct')) {
                score++;
                scores += "<td>OK</td>";
            } else {
                scores += "<td>-</td>";
            }
        }
    }
    document.getElementById('score').innerHTML = scores+"</table>";
    return score;
}
function autoResize() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}
getKoan();

