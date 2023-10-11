const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const url = 'https://oboulo.lfz.duckdns.org/qcm/qcm_evalv2.php?theme=60&filiere=2&nbQuestion=50';

axios.get(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const questions = [];

        $('input#Ref3, input#Answ3').each((i, el) => {
            const input = $(el);
            const inputId = input.attr('id');
            const inputVal = input.val().trim();

            if (inputId === 'Ref3') {
                question.reference = inputVal;
                input.val('new_reference_value');
            } else if (inputId === 'Answ3') {
                question.answer = inputVal;
                input.val('new_answer_value');
            }
        });

        const data = JSON.stringify(questions, null, 2);

        fs.writeFile('questions.json', data, err => {
            if (err) throw err;
            console.log('Questions saved to questions.json');
        });
    });

const request = require('request');
const username = 'your_username';
const password = 'your_password';
const url = 'https://example.com/protected-page';

const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

request.get({
    url: url,
    headers: {
        'Authorization': auth
    }
}, (error, response, body) => {
    if (error) {
        console.error(error);
    } else {
        console.log(body);
    }
});
