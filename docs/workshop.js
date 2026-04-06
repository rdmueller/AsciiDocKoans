
let koanNum = getCookie("koanNum");
if (koanNum === "") {
  koanNum = 1;
}
var targetHtml = ""
var asciidoctor = Asciidoctor();
var kroki = AsciidoctorKroki;
if (kroki && kroki.register) {
    kroki.register(asciidoctor.Extensions);
}
var defaultAttrs = {'imagesdir': 'images', 'kroki-server-url': 'https://kroki.io'};
var totalExercises = 0;

// Count all exercises across all koans at startup
function countAllExercises() {
    var koan = 1;
    function fetchNext() {
        fetch("workshop/koan_" + koan + ".adoc")
            .then(function(response) {
                if (!response.ok) {
                    // Done counting
                    updateProgressTotal();
                    return;
                }
                return response.text();
            })
            .then(function(text) {
                if (!text) return;
                // Count sub-parts (separated by '''')
                var parts = text.split("''''");
                totalExercises += parts.length;
                koan++;
                fetchNext();
            });
    }
    fetchNext();
}

function updateProgressTotal() {
    var label = document.getElementById('progress-label');
    if (label && totalExercises > 0) {
        var results = document.getElementsByClassName('rendered');
        var score = 0;
        for (var i = 0; i < results.length; i++) {
            if (results[i].classList.contains('correct')) score++;
        }
        label.textContent = score + ' / ' + totalExercises;
        var fill = document.getElementById('progress-fill');
        if (fill) fill.style.width = Math.round(score / totalExercises * 100) + '%';
    }
}

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
            } else if (response.status === 404) {
                // No more koans — show completion message
                var content = document.getElementById('content');
                content.insertAdjacentHTML("beforeend",
                    "<hr /><div class='description'><h2>Congratulations!</h2>" +
                    "<p>You have completed all available koans.</p></div>");
                return null;
            } else {
                alert("HTTP-Error: " + response.status);
                return null;
            }
        })
        .then(function (koan) {
            if (koan === null) return;
            var content = document.getElementById('content');
            //content.innerHTML += document.getElementById('template').innerHTML.replaceAll('%%',koanNum)
            koanParts = koan.split("''''")
            let partNum = 0
            koanParts.forEach(function(part) {
                    part = part.split("'''");
                    content.insertAdjacentHTML("beforeend", document.getElementById('template').innerHTML.replaceAll('%%',koanNum+'.'+partNum));
                    let description = document.getElementById('description'+koanNum+'.'+partNum);
                    description.innerHTML = asciidoctor.convert(part[0], {attributes: defaultAttrs}); // trusted koan content
                    var target = document.getElementById('target'+koanNum+'.'+partNum);
                    target.innerHTML = asciidoctor.convert(part[1], {attributes: defaultAttrs}); // trusted koan content
                    var hint = document.getElementById('hint'+koanNum+'.'+partNum);
                    hint.innerHTML = asciidoctor.convert(part[2], {attributes: defaultAttrs}); // trusted koan content
                    var plain = document.getElementById('input'+koanNum+'.'+partNum);
                    plain.addEventListener('keyup', function(e) {
                        var regexp = new RegExp('^[a-z]+([0-9]+)[.]([0-9]+)$');
                        var match = regexp.exec(e.target.id);
                        console.log(e.target.id);
                        console.log(match);
                        convert(match[1], match[2]);
                        saveInput(match[1], match[2], e.target.value);
                    });
                    plain.addEventListener('input', autoResize, false);
                    plain.addEventListener('focusin', autoResize, false);
                    plain.style.height = 'auto';
                    plain.style.height = plain.scrollHeight + 'px';
                    var saved = loadInput(koanNum, partNum);
                    plain.value = saved !== null ? saved : part[3];
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
    var inputHtml = asciidoctor.convert(content, {attributes: defaultAttrs})
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
        clearInput(koanNum, partNum);
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
    document.getElementById('score').innerHTML = scores+"</table>"; // trusted static content only
    var total = totalExercises > 0 ? totalExercises : results.length;
    var pct = total > 0 ? Math.round(score / total * 100) : 0;
    var fill = document.getElementById('progress-fill');
    var label = document.getElementById('progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = score + ' / ' + total;
    return score;
}
function autoResize() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}
var saveTimer = null;
function saveInput(koan, part, value) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function() {
        try { localStorage.setItem('koan-' + koan + '-' + part, value); } catch(e) {}
    }, 300);
}
function loadInput(koan, part) {
    try { return localStorage.getItem('koan-' + koan + '-' + part); } catch(e) { return null; }
}
function clearInput(koan, part) {
    try { localStorage.removeItem('koan-' + koan + '-' + part); } catch(e) {}
}
countAllExercises();
getKoan();

