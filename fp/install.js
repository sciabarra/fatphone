// Disable caching of AJAX responses
$.ajaxSetup({
	cache : false
});

// catalog manager
var cm;

// remote content post
function postUrl(action) {
	return $('#url').val() + "/ContentServer"
			+ "?pagename=OpenMarket/Xcelerate/Actions/RemoteContentPost"
			+ "&authusername=" + $('#user').val() + "&authpassword="
			+ $('#pass').val();
	// + "?pagename=OpenMarket/Gator/XMLPost/" + action +
}

// add messages to the message area
function msg(message) {
	// if("answer" in message)
	// message = message.answer;
	$("#message").html($("#message").html() + "\n" + message)
}

// install an element asset
function installElement(type, elementName, nextStep) {

	// calculate remote and local file names from the element
	var m = /^(.*)\/(.*)$/.exec(elementName);
	// console.log("**" + m);
	// console.log(elementName);

	if (m) {
		if (m[1] == "") {
			var remoteFileName = m[2] + ".jsp";
			var remoteFileFolder = 'Typeless';
			var localFile = type + elementName + ".jspf";
		} else {
			var remoteFileName = m[2] + ".jsp";
			var remoteFileFolder = m[1];
			var localFile = type + "/" + elementName + ".jspf";
		}
	} else {
		var remoteFileFolder = "";
		var remoteFileName = elementName + ".jsp";
		var localFile = type + "/" + elementName + ".jspf";
	}

	cm.checkExist("ElementCatalog", "elementname='" + elementName + "'", // found?
	function(status) {
		console.log("found");
		$.get(localFile, function(fileBody) {
			cm.editRow("ElementCatalog", {
				elementname : elementName,
				url : fileBody,
				url_file : remoteFileName,
				url_folder : remoteFileFolder
			}, nextStep);
		})
	}, // not found?
	function(status) {
		("not found");
		$.get(localFile, function(fileBody) {
			// alert("addrow")
			cm.addRow("ElementCatalog", {
				elementname : elementName,
				url : fileBody,
				url_file : remoteFileName,
				url_folder : remoteFileFolder
			}, nextStep)
		})
	});
}

// upload the asset with the remote post
function postAsset(action, data, nextStep) {

	// add the publication
	data.publication = $("#pub").val();

	// specify the action
	data.Action = action;

	console.log(data);

	// delete the asset then post to the remote url entry point
	$.post(postUrl(), data, function(result) {
		// console.log(result)
		// msg(result)
		var m = /^Success:.*, ([0-9]+) saved\.$/.exec(result);
		if (m) {
			// update element with the tid
			/*
			 * if ("rootelement" in data) cm.editRow("ElementCatalog", {
			 * "elementname" : data.rootelement, "resdetails1" : "tid=" + m[1] },
			 * nextStep)
			 */

			nextStep(result);
		} else {
			nextStep("save failed!")
		}
		nextStep(result);
	})
}

// install an asset
/*
 * function installAsset(type, name, nextStep) { elementName = name; jsonFile =
 * type + "/" + name + ".json";
 * 
 * var where = "name='" + name + "'"; cm.checkExist(type, where, // found?
 * function(result) { $.getJSON(jsonFile, function(data) { // propagate id
 * collected when searched the asset data.id = result.id; postAsset("update",
 * data, nextStep); }) }, // not found? function() { alert("not found")
 * $.getJSON(jsonFile, function(data) { postAsset("addrow", data, nextStep) })
 * }); }
 */

function installAsset(type, name, nextStep) {
	jsonFile = type + "/" + name + ".json";
	$.getJSON(jsonFile, function(data) {
		if ("rootelement" in data)
			var where = "rootelement='" + data.rootelement + "'";
		else
			var where = "name='" + name + "'";
		cm.checkExist(type, where, // found?
		function(result) {
			alert("found");
			// propagate id collected when searched the asset
			data.id = result.id;
			postAsset("update", data, nextStep);
		}, // not found?
		function() {
			alert("not found")
			$.getJSON(jsonFile, function(data) {
				postAsset("addrow", data, nextStep)
			})
		});
	})
}

// assets installer
function installAssets() {
	$("table#assetTable tr").each(function(node) {

		var cells = $(this).children();
		var isChecked = $(cells[0]).children("input").is(":checked");
		var match = /(.*):(.*)/.exec($(cells[1]).text());
		var out = $(cells[2]);

		if (isChecked)
			installAsset(match[1], match[2], function(result) {
				console.log(status)
				out.html(result)
			})
		else
			out.html("...skipped")
	});
}

// elements installer
function installElements() {

	$("table#elementTable tr").each(function(node) {

		var cells = $(this).children();
		var isChecked = $(cells[0]).children("input").is(":checked");
		var match = /(.*):(.*)/.exec($(cells[1]).text());
		var out = $(cells[2]);

		// if (isChecked)
		// out.html("<b>" + match[1] + "</b><i>" + match[2] + "</i>");
		// else
		// out.html("nosel");
		if (isChecked)
			installElement(match[1], match[2], function(status) {
				console.log(status)
				out.html(status.result)
			})
		else
			out.html("...skipped")
	});
	$("#installAssets").attr("disabled", false)
}

function toggleAll(where) {
	console.log($("table" + where).find(":checkbox"));
	$("table" + where).find(":checkbox").each(function(node) {
		console.log(this);
		$(this).attr("checked", !$(this).is(":checked"));
	});
}

// login
function login() {
	// alert("login")
	// msg("logging...")
	cm = new CatalogManager($('#url').val());
	// msg("creato cm")
	cm.login($('#user').val(), $('#pass').val(), // found:
	function(result) {
		msg("Connection Parameters are ok.");
		$("#login").attr("disabled", true);
		$("#url").attr("disabled", true);
		$("#user").attr("disabled", true);
		$("#pass").attr("disabled", true);
		$("#installElements").attr("disabled", false)
		msg(result.answer);
	}, // not found:
	function(result) {
		alert("Login failed, please check paramenters")
		msg(result.answer);
	})
}

$(function() {
	$("#login").click(login);
	$("#installElements").click(installElements);
	$("#installAssets").click(installAssets);
	$("#allElements").click(function() {
		toggleAll("#elementTable")
	});
	$("#allAssets").click(function() {
		toggleAll("#assetTable")
	});
})
