const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const url_base = 'https://oboulo.lfz.duckdns.org/qcm/';
const url_direct = "qcm_eval.php?theme=62&filiere=2&nbQuestion=50";
const username = 'snt';
const password = 'snt';

const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

let url_final, url_json;
const questions = {};

axios.get(url_base + url_direct, { headers: { 'Authorization': auth } }).then(response => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('.ui-corner-all.custom-corners').each((i, el) => {
        const questionDiv = $(el);
        const questionNumber = questionDiv.find('.ui-bar.ui-bar-a h1').text().trim().split(')')[0];
        const refInput = questionDiv.find('input[id^="Ref"]').attr('id');
        const refValue = $('#' + refInput).val().trim();
        const rInput = questionDiv.find('input[id^="R"]').attr('id');
        const rValue = $('#' + rInput).val().trim();

        questions[refValue] = rValue;
    });

    if (Object.keys(questions).length === 0) {
        console.error('Questions object is empty');
    } else {
        url_json = JSON.stringify(questions);

        fs.writeFile('questions.json', url_json, err => {
            if (err) throw err;
            console.log('Questions saved to questions.json');
        });

        url_final = url_base + "controler_notation2.php?jsonReturnString=" + url_json;

        fs.writeFile("url.txt", url_final, err => {
            if (err) throw err;
            console.log('URL saved to url.txt');
        });
    }
});
