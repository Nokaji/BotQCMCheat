const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const url_base = 'https://oboulo.lfz.duckdns.org/qcm/';
const url_direct = "qcm_evalv2.php?theme=60&filiere=2&nbQuestion=50";
const username = '1g7.leandre.roger-geslin';
const password = '1g7#16/12/2007';

const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

let temp_val, temp_num, url_final, pre_url_json, url_json, note = 0;
const questions = {};

axios.get(url_base + url_direct, { headers: { 'Authorization': auth } }).then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const inputs = [];

    url_final = url_base + "controler_notation2.php";

    $('input').each((i, el) => {
        const inputElement = $(el);
        const inputId = inputElement.attr('id');
        const inputVal = inputElement.val().trim();

        inputs.push({
            id: inputId,
            value: inputVal
        });

        if (inputId.includes('Ref')) {
            const refNum = inputId.match(/\d+/)[0];
            const ansNum = inputId.replace('Ref', 'Answ');
            const ansVal = $(`#${ansNum}`).val().trim();
            questions[inputVal] = ansVal;
        }
    });

    if (Object.keys(questions).length === 0) {
        console.error('Questions object is empty');
    } else {
        url_json = decodeURIComponent(JSON.stringify(questions));
        const data = JSON.stringify(inputs, null, 2);

        fs.writeFile('questions.json', data, err => {
            if (err) throw err;
            console.log('Questions saved to questions.json');
        });

        fs.writeFile("url.txt", url_final + "?jsonReturnString=" + url_json, err => {
            if (err) throw err;
            console.log('Url saved to url.txt');
        });

        fs.writeFile("url.json", url_json, err => {
            if (err) throw err;
            console.log('Url saved to url.json');
        });
    }

    function doRequest(){
        axios.get(url_final, { params: { jsonReturnString: url_json }, headers: { 'Authorization': auth } })
        .then(secondResponse => {
            console.log(`Status : ${secondResponse.status}`);
            if (secondResponse.status >= 200 && secondResponse.status < 300) {
                const noteMatch = secondResponse.data.match(/(\d+)\s*\/\s*20/);
                if (noteMatch) {
                    const resultat = parseInt(noteMatch[1]);
                    console.log(`url_json : ${url_json}`);
                    console.log(`Résultat : ${resultat}`);

                    if (resultat > lastResultat) {
                        lastResultat = resultat;
                        // Répéter la requête après 2500 ms
                        setTimeout(makeRequest, 2500);
                    } else {
                        // La note n'a pas augmenté, passer à la prochaine valeur
                        currentIndex++;
                        // Répéter la requête après 2500 ms
                        setTimeout(makeRequest, 2500);
                    }
                }
            }
        })
        .catch(error => {
            console.error('Erreur dans la deuxième requête GET :', error);
        });
    }
    doRequest();
});