/*
 * Copyright (C) 2017 phantombot.tv
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @author IllusionaryOne
 */

/*
 * donationsPanel.js
 */

(function() {

    var sortType = 'alpha_asc'; //amount, time

    /**
     * @function onMessage
     * This event is generated by the connection (WebSocket) object.
     */
    function onMessage(message) {
        var msgObject;

        try {
            msgObject = JSON.parse(message.data);
        } catch (ex) {
            return;
        }

        if (panelHasQuery(msgObject)) {
            if (panelCheckQuery(msgObject, 'donations_donations')) {
                var html = '<table>',
                    donationData = [],
                    donationObject;

                for (idx in msgObject['results']) {
                    try {
                        JSON.parse(msgObject['results'][idx]['value']);
                    } catch (e) {
                        continue;
                    }
                    donationData[idx] = [];
                    donationData[idx]['key'] = msgObject['results'][idx]['key'];
                    donationData[idx]['value'] = msgObject['results'][idx]['value'];
                }

                if (donationData.length === 0) {
                    html = "<i>No Data in Donations Table</i>";
                    $('#donationsTable').html(html);
                    return;
                }

                if (panelMatch(sortType, 'time_asc')) {
                    donationData.sort(sortDonationTable_time_asc);
                }
                if (panelMatch(sortType, 'time_desc')) {
                    donationData.sort(sortDonationTable_time_desc);
                }
                if (panelMatch(sortType, 'amount_asc')) {
                    donationData.sort(sortDonationTable_amount_asc);
                }
                if (panelMatch(sortType, 'amount_desc')) {
                    donationData.sort(sortDonationTable_amount_desc);
                }
                if (panelMatch(sortType, 'alpha_asc')) {
                    donationData.sort(sortDonationTable_alpha_asc);
                }
                if (panelMatch(sortType, 'alpha_desc')) {
                    donationData.sort(sortDonationTable_alpha_desc);
                }

                for (idx in donationData) {
                    try {
                        donationObj = JSON.parse(donationData[idx]['value']);
                    } catch (e) {
                        continue;
                    }
                    if (donationObj['currency'] !== undefined && donationObj['name'] !== undefined) {
                        html += '<tr class="textList">' +
                                '    <td>' + donationObj['name'] + '</td>' +
                                '    <td>' + $.format.date(parseInt(donationObj['created_at']) * 1e3, 'MM.dd.yy hh:mm:ss') + '</td>' +
                                '    <td style="float: right">' + donationObj['currency'] + ' ' + parseInt(donationObj['amount']).toFixed(2) + '</td>' +
                                '</tr>';
                    } else if (donationObj['parameters'] !== undefined) {
                        html += '<tr class="textList">' +
                                '    <td>' + donationObj['parameters']['username'] + '</td>' +
                                '    <td>' + $.format.date(new Date(donationObj['created_at']), 'MM.dd.yy hh:mm:ss') + '</td>' +
                                '    <td style="float: right">' + donationObj['parameters']['currency'] + ' ' + parseInt(donationObj['parameters']['amount']).toFixed(2) + '</td>' +
                                '</tr>';
                    } else if (donationObj['createdAt'] !== undefined && donationObj['donation'] !== undefined) {
                        html += '<tr class="textList">' +
                            '    <td>' + donationObj['donation']['user']['username'] + '</td>' +
                            '    <td>' + $.format.date(new Date(donationObj['createdAt']), 'MM.dd.yy hh:mm:ss') + '</td>' +
                            '    <td style="float: right">' + donationObj['donation']['currency'] + ' ' + parseInt(donationObj['donation']['amount']).toFixed(2) + '</td>' +
                            '</tr>';
                    } else {
                        if (donationObj['user'] !== undefined && donationObj['user']['name'] !== undefined) {
                            html += '<tr class="textList">' +
                                    '    <td>' + donationObj['user']['name'] + '</td>' +
                                    '    <td>' + $.format.date(new Date(donationObj['date']), 'MM.dd.yy hh:mm:ss') + '</td>' +
                                    '    <td style="float: right">' + donationObj['currencyCode'] + ' ' + parseInt(donationObj['amount']).toFixed(2) + '</td>' +
                                    '</tr>';
                        }
                    }
                }

                $('#donationsTable').html(html);
            }
        }
    }

    /**
     * @function setDonationSort
     * @param {String} type
     */
    function setDonationSort(type) {
        sortType = type;
        doQuery();
    }

    /**
     * @function sortDonationTable
     * @param {Object} a
     * @param {Object} b
     */
    function sortDonationTable_alpha_asc(a, b) {
        var aObj = JSON.parse(a.value);
        var bObj = JSON.parse(b.value);
        return panelStrcmp(aObj.name, bObj.name);
    }
    function sortDonationTable_alpha_desc(a, b) {
        var aObj = JSON.parse(a.value);
        var bObj = JSON.parse(b.value);
        return panelStrcmp(bObj.name, aObj.name);
    }
    function sortDonationTable_time_asc(a, b) {
        var aObj = JSON.parse(a.value);
        var bObj = JSON.parse(b.value);
        return parseInt(aObj.created_at) - parseInt(bObj.created_at);
    }
    function sortDonationTable_time_desc(a, b) {
        var aObj = JSON.parse(a.value);
        var bObj = JSON.parse(b.value);
        return parseInt(bObj.created_at) - parseInt(aObj.created_at);
    }
    function sortDonationTable_amount_asc(a, b) {
        var aObj = JSON.parse(a.value);
        var bObj = JSON.parse(b.value);
        return parseInt(aObj.amount) - parseInt(bObj.amount);
    }
    function sortDonationTable_amount_desc(a, b) {
        var aObj = JSON.parse(a.value);
        var bObj = JSON.parse(b.value);
        return parseInt(bObj.amount) - parseInt(aObj.amount);
    }

    /**
     * @function doQuery
     */
    function doQuery() {
        sendDBKeys('donations_donations', 'donations');
    }

    // Add donations hooks
    addPanelTab( 'donations', 'Donations', '/panel/donations.html', 400 );
    addDoQuery( 'donations', doQuery, 3e4 );

    addOnMessage( 'donations', onMessage );

    // Export for HTML
    $.donationsOnMessage = onMessage;
    $.donationsDoQuery = doQuery;
    $.setDonationSort = setDonationSort;
})();
