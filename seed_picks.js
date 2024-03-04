// ==UserScript==
// @name         Seed Picks
// @namespace    http://tampermonkey.net/
// @version      2024-03-04
// @description  做种精选
// @author       bahtyar
// @match        https://*tjupt.org/torrents.php*
// @match        https://*tjupt.org/torrents_new.php*
// @icon         https://www.tjupt.org/assets/favicon/favicon.svg
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var site_url = decodeURI(location.href);

    function calculateA(Ti, T0, Si, Ni, N0) {
        const term1 = 1 - Math.pow(10, -Ti / T0);
        const term2 = Si * (1 + Math.sqrt(2) * Math.pow(10, -(Ni - 1) / (N0 - 1)));
        return term1 * term2;
    }

    function addColumnToTable() {
        const table0 = document.getElementsByClassName('torrents')[0];

        if (!table0) {
            console.error('Table with class "torrents" not found.');
            return;
        }
        const table = table0.tBodies[0];
        // console.log("Table", table)
        const rows = table.children;
        // console.log("行数", rows.length)

        const valueA = document.createElement('td');
        valueA.textContent = "A值";
        valueA.className = "colhead"
        rows[0].appendChild(valueA);

        const point = document.createElement('td');
        point.textContent = "时魔";
        point.className = "colhead"
        rows[0].appendChild(point);

        for (let i = 1; i < rows.length; i++) {
            // console.log("row", rows[i])
            const cells = rows[i].children;
            // console.log(cells)
            const tr = cells[i];
            // 获取时间差（单位：小时）、体积（单位：GB）、#seeders
            const timeString = cells[3].innerHTML;
            // console.log(timeString)
            const timeDifference = calculateTimeDifference(timeString); // 计算时间差
            const volume = parseFloat(convertToGB(cells[4].textContent.trim()));
            const seeders = parseFloat(cells[5].textContent.trim());
            console.log(timeString, timeDifference, volume, seeders)
            const resultA = calculateA(timeDifference, 4, volume, seeders, 7);
            // console.log(resultA)
            const result = calculateB(resultA, 300, 130)
            const resultACell = document.createElement('td');
            resultACell.textContent = resultA.toFixed(2); 
            rows[i].appendChild(resultACell);
            const resultCell = document.createElement('td');
            resultCell.textContent = result.toFixed(2); // 保留两位小数
            rows[i].appendChild(resultCell);
        }
    }

    function calculateTimeDifference(timeString) {
        const currentTime = new Date();
        const uploadTime = new Date(timeString.replace('<br>', ' '));
        const timeDifferenceInMilliseconds = currentTime - uploadTime;
        return timeDifferenceInMilliseconds / (1000 * 60 * 60 * 7 * 24); // 转换为周
    }

    function calculateB(A, L, B0) {
        const pi = Math.PI;
        const arctanValue = Math.atan(A / L);
        const result = (B0 * 2 / pi) * arctanValue;
        return result;
    }

    function convertToGB(inputString) {
        const regex = /(\d+(\.\d+)?)\s*([KkMmGgTt]?i?[Bb])/;
        const match = inputString.match(regex);

        if (match) {
            const value = parseFloat(match[1]);
            const unit = match[3].toUpperCase();

            switch (unit) {
                case 'KIB':
                    return value / (1024 * 1024);
                case 'MIB':
                    return value / 1024;
                case 'GIB':
                    return value;
                case 'TIB':
                    return value * 1024;
                default:
                    console.error('Unsupported unit:', unit);
                    return NaN;
            }
        } else {
            console.error('Invalid input string:', inputString);
            return NaN;
        }
    }
    window.addEventListener('load', addColumnToTable);
})();
