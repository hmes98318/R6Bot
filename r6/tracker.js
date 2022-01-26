const axios = require("axios");
const cheerio = require("cheerio");
const R6 = require('./r6.js');


axios.default.defaults.timeout = 5000;


module.exports = {

    Profile: function (profile, url_profile) {
        return new Promise(function (resolve, reject) {
            axios.get(url_profile, { validateStatus: false })
                .then(function (body) {
                    let $ = cheerio.load(body.data);

                    $('#profile .trn-defstat__value').each(function (i, elem) {
                        profile.push(R6.FilterArray($(this).text().split('\n')));
                    })
                    resolve(profile);
                })
                .catch(function (error) {
                    console.log("Extraction error : ", error);
                    reject(error);
                });
        });
    },

    Header: function (header, url_profile) {
        return new Promise(function (resolve, reject) {
            axios.get(url_profile, { validateStatus: false })
                .then(function (body) {
                    let $ = cheerio.load(body.data);

                    let imgurl = $('img').map(function () {
                        return $(this).attr('src')
                    });//console.log(imgurl.toArray());
                    header = imgurl.toArray()[0];
                    resolve(header);
                })
                .catch(function (error) {
                    console.log("Extraction error : ", error);
                    reject(error);
                });
        })
    },

    Operators: function (operators, url_operators) {
        return new Promise(function (resolve, reject) {
            axios.get(url_operators, { validateStatus: false })
                .then(function (body) {
                    let $ = cheerio.load(body.data);

                    $('#profile .trn-table__row').each(function (i, elem) {
                        operators.push($(this).text().split('\n'))
                    })
                    resolve(operators);
                })
                .catch(function (error) {
                    console.log("Extraction error : ", error);
                    reject(error);
                });
        });
    }
}