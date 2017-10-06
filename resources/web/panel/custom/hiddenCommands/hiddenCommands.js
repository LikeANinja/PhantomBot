var hiddenCommands = function() {

	function init() {

		var accordianHeader = $( '<h3>' ).text( 'Hidden Commands' );
		var accordianBody = $( '<div>' ).append( $('<div>').attr( 'id', 'hiddenCommands' ).css( {'max-height' : '400px'} ) );

		$( '#customCommandsAccordion' ).append( accordianHeader ).append( accordianBody ).accordion('destroy').accordion( { clearStyle: true, heightStyle: "panel", icons: null } );

	}

	init();

	function onMessage(message) {
        var msgObject;
        try {
            msgObject = JSON.parse(message.data);
        } catch (ex) {
            return;
        }

        if (panelCheckQuery(msgObject, 'customCommands_hidden')) {

            html = "<table>";
            for (idx in msgObject['results']) {
                commandName = msgObject['results'][idx]['key'];
                hiddenTrueFalse = msgObject['results'][idx]['value'];
                commandNameSafe = commandName.replace(/\?/g, '__QM__');


                hiddenClass = 'fa-bell';

                if ( hiddenTrueFalse == 'true' ) {
                    hiddenClass = 'fa-bell-slash';
                }

                foundData = true;
                html += '<tr style="textList">' +
                '    <td >!' + commandName + '</td>' +
                '    <td style="vertical-align: middle; width: 10%">' +
                '        <form onkeypress="return event.keyCode != 13">' +
                '              <button type="button" class="btn btn-default btn-xs" id="hideCommand_' + commandNameSafe.replace(/[^a-zA-Z0-9_]/g, '_SP_') + '" onclick="$.hideCommand(\'' + commandName + '\')"><i class="fa '+hiddenClass+'" /> </button>' +
                '        </form>' +
                '    </td>' +
                '</tr>';
            }
            html += "</table>";

            if (!foundData) {
                html = "<i>No entries in cooldown table.</i>";
            }
            $("#hiddenCommands").html(html);
        }


    }


    /**
     * @function doQuery
     */
    function doQuery() {
        sendDBKeys("customCommands_hidden", "hiddenCommands");
    }

    var interval = setInterval(function() {
        if (isConnected && TABS_INITIALIZED) {
            var active = $("#tabs").tabs("option", "active");
            if (active == 1) {
                doQuery();
                clearInterval(interval);
            }
        }
    }, INITIAL_WAIT_TIME);

    // Query the DB every 30 seconds for updates.
    setInterval(function() {
        var active = $("#tabs").tabs("option", "active");
        if (active == 1 && isConnected && !isInputFocus()) {
            doQuery();
        }
    }, 3e4);

    /**
     * @function hideCommand
     * @param {String} command
     */
    function hideCommand(command) {
    	console.log( 'jkhdfsakjbhgfdakbjfgdakjbnfglkjnfg')
        $("#hideCommand_" + command.replace(/[^a-zA-Z0-9_]/g, '_SP_')).html("<i style=\"color: var(--main-color)\" class=\"fa fa-spinner fa-spin\" />");
        command = command.toLowerCase();
        sendWSEvent('commands', './custom/hiddenCommands.js', null, ['hide', command]);
        sendDBKeys("commands_hidden", "hiddenCommands");
        setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME );
        setTimeout(function() { sendCommand("reloadcommand " + command); }, TIMEOUT_WAIT_TIME );
    };

    function aliasCommand() {
        var main = $('#aliasCommandInput').val();
        var alias = $('#aliasCommandInputAlias').val();

        if (alias.length == 0) {
            $("#aliasCommandInputAlias").val("[ERROR] Please enter a value.");
            setTimeout(function() { $("#aliasCommandInputAlias").val(""); }, TIMEOUT_WAIT_TIME * 2);
            return;
        } else if (main.length == 0) {
            $("#aliasCommandInput").val("[ERROR] Please enter a value.");
            setTimeout(function() { $("#aliasCommandInput").val(""); }, TIMEOUT_WAIT_TIME * 2);
            return;
        }

        alias = alias.replace('!', '');
        main = main.replace('!', '');
        sendDBUpdate("addCommandAlias", "aliases", main.toLowerCase(), alias.toLowerCase());
        sendDBUpdate("addHiddenAlias", "hiddenCommands", main.toLowerCase(), 'false');
        setTimeout(function() { $('#aliasCommandInput').val(""); $('#aliasCommandInputAlias').val(""); sendCommand("reloadcommand"); }, TIMEOUT_WAIT_TIME);
        setTimeout(function() { doQuery(); }, TIMEOUT_WAIT_TIME);
    };

    addDoQuery( 'customCommands', doQuery, 3e4 );
    addOnMessage( 'customCommands', onMessage );

    $.customCommandsOnMessage = onMessage;
    $.customCommandsDoQuery = doQuery;
    $.hideCommand = hideCommand;
    $.aliasCommand = aliasCommand;

}

hiddenCommands();