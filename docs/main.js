let koanNum = getCookie("koanNum");
if (koanNum === "") {
  koanNum = 1;
}
var targetHtml = ""
var asciidoctor = Asciidoctor();

function init() {
    console.log("init");
    //document.getElementById('input'+koanNum).focus();
    targetHtml = document.getElementById('target'+koanNum).innerHTML
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
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
    fetch("koans/koan_"+koanNum+".adoc")
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
            content.insertAdjacentHTML("beforeend", document.getElementById('template').innerHTML.replaceAll('%%',koanNum));
            koan = koan.split("'''")
            var description = document.getElementById('description'+koanNum);
            description.innerHTML = asciidoctor.convert(":imagesdir: images\n\n" + koan[0], {to: 'html5'});
            var target = document.getElementById('target'+koanNum);
            console.log(asciidoctor.convert(koan[1], {to: 'html5'}))
            target.innerHTML = asciidoctor.convert(koan[1], {to: 'html5'});
            var hint = document.getElementById('hint'+koanNum);
            hint.innerHTML = asciidoctor.convert(":imagesdir: images\n\n" + koan[2], {to: 'html5'});
            var plain = document.getElementById('input'+koanNum);
            plain.value = koan[3];
            init();
            convert();
        });
}
function convert() {
    console.log("convert");
    var content = document.getElementById('input'+koanNum).value;
    var inputHtml = asciidoctor.convert(content, {to: 'html5'});
    document.getElementById('rendered'+koanNum).innerHTML = inputHtml;
    var rendered = document.getElementById('rendered'+koanNum)
    if (targetHtml === inputHtml) {
        //correct
        rendered.style.borderColor = '#88ff88';
        rendered.classList.add("correct");
        koanNum++;
        setCookie("koanNum", koanNum, 365*100);
        getKoan();
        window.setTimeout(function() {
            var descr = document.getElementById ('description'+koanNum)
            console.log(descr);
            console.log(koanNum);
            descr.scrollIntoView ( true );
        },500);
    } else {
        rendered.style.borderColor = '#ff8888';
        rendered.classList.remove("correct");
    }

};
function next() {
    koanNum++;
    setCookie("koanNum", koanNum, 365*10);
    document.getElementById('nextDialog').classList.remove("display");
    getKoan();
}
getKoan();
