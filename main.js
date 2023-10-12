const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const url_base = 'https://oboulo.lfz.duckdns.org/qcm/';
const url_direct = "qcm_evalv2.php?theme=60&filiere=2&nbQuestion=50";
const username = 'snt';
const password = 'snt';

const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

let temp_val, temp_num, url_final, pre_url_json, url_json;
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
        const data = JSON.stringify(inputs, null, 2);
        url_json = encodeURIComponent(JSON.stringify(questions));

        fs.writeFile('questions.json', data, err => {
            if (err) throw err;
            console.log('Questions saved to questions.json');
        });

        fs.writeFile("url.txt", url_final, err => {
            if (err) throw err;
            console.log('Url saved to url.txt');
        });

        fs.writeFile("url.json", url_json, err => {
            if (err) throw err;
            console.log('Url saved to url.json');
        });

        // Inclure la deuxième requête GET ici
        axios.get(url_final + '?jsonReturnString=' + url_json, { headers: { 'Authorization': auth } })
            .then(secondResponse => {
                console.log(`Status : ${secondResponse.status}`);
            })
            .catch(error => {
                console.error('Error in the second GET request:', error);
            });
    }
});