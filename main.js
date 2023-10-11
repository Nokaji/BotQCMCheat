
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const url_base = 'https://oboulo.lfz.duckdns.org/qcm/';
const url_direct = "qcm_evalv2.php?theme=60&filiere=2&nbQuestion=50";
const url_auth = 'https://example.com/protected-page';
const username = 'snt';
const password = 'snt';

const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

let temp_val;
let temp_num;

axios.get(url_base + url_direct, { headers: { 'Authorization': auth } })
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const questions = [];

        $('input').each((i, el) => {
            temp_val = int();
            temp_num = int();
            const input = $(el);
            const inputId = input.attr('id');
            const inputVal = input.val().trim();

            questions.push({
                id: inputId,
                value: inputVal
            });

            if(inputId.includes('Ref')) {
                const refNum = inputId.match(/\d+/)[0];
                question.reference = inputVal;
                question.refNum = refNum;
                temp_val = inputVal;
            }else if (inputId.includes("Answ")){
                const ansNum = inputId.match(/\d+/)[0];
                question.answer = inputVal;
                question.ansNum = ansNum;
            }
        });

        url_final = url_base + "controler_notation2.php";
        url_final += "";

        const data = JSON.stringify(questions, null, 2);

        fs.writeFile('questions.json', data, err => {
            if (err) throw err;
            console.log('Questions saved to questions.json');
        });

        fs.writeFile("url.txt", url_final, err => {
            if(err) throw err;
            console.log('Url saved to url.txt');
        });
    })
    const question = {
        reference: '',
        answer: ''
    };