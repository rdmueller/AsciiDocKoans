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
                    console.log('partnum: '+partNum);
                    content.insertAdjacentHTML("beforeend", document.getElementById('template').innerHTML.replaceAll('%%',koanNum+'.'+partNum));
                    let description = document.getElementById('description'+koanNum+'.'+partNum);
                    description.innerHTML = asciidoctor.convert(":imagesdir: images\n\n" + part[0], {to: 'html5'});
                    var target = document.getElementById('target'+koanNum+'.'+partNum);
                    console.log(asciidoctor.convert(part[1], {to: 'html5'}))
                    target.innerHTML = asciidoctor.convert(part[1], {to: 'html5'});
                    var hint = document.getElementById('hint'+koanNum+'.'+partNum);
                    hint.innerHTML = asciidoctor.convert(":imagesdir: images\n\n" + part[2], {to: 'html5'});
                    var plain = document.getElementById('input'+koanNum+'.'+partNum);
                    plain.addEventListener('keyup', function(e) {
                        convert(e.target.id.split('.')[1]);
                    });
                    plain.addEventListener('input', autoResize, false);
                    plain.addEventListener('focusin', autoResize, false);
                    plain.style.height = 'auto';
                    plain.style.height = plain.scrollHeight + 'px';
                    console.log("plain: "+plain);
                    console.log("plain.value: "+plain.value);
                    plain.value = part[3];
                    console.log(plain.value);
                    init(partNum);
                    convert(partNum);
                    partNum++;
            })
            content.insertAdjacentHTML("beforeend", document.getElementById('templateButton').innerHTML.replaceAll('%%',koanNum+'.'+partNum));
        });
}
function convert(partNum) {
    console.log("convert:"+koanNum+'.'+partNum);
    var content = document.getElementById('input'+koanNum+'.'+partNum).value;
    var inputHtml = asciidoctor.convert(content, {to: 'html5'});
    document.getElementById('rendered'+koanNum+'.'+partNum).innerHTML = inputHtml;
    var rendered = document.getElementById('rendered'+koanNum+'.'+partNum)
    var targetHtml = document.getElementById('target'+koanNum+'.'+partNum).innerHTML;
    if (targetHtml === inputHtml) {
        //correct
        rendered.style.borderColor = '#88ff88';
        rendered.classList.add("correct");

        //next();
        //window.setTimeout(function() {
        //    var descr = document.getElementById ('description'+koanNum+'.'+partNum)
        //    console.log(descr);
        //    console.log(koanNum+'.'+partNum);
        //    descr.scrollIntoView ( true );
        //},500);


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

function autoResize() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}
getKoan();
