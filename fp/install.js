/*
Copyright (C) 2011 by Michele Sciabarra'

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// Disable caching of AJAX responses
$.ajaxSetup({
	cache : false,
	async : false
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

// install a site catalog
function installEntry(pagename, localFile, nextStep) {
	cm.checkExist("SiteCatalog", "pagename='" + pagename + "'",
	// found?
	function(status) {
		$.getJSON(localFile, function(data) {
			cm.editRow("SiteCatalog", data, nextStep);
		});
	}, // not found
	function(status) {
		$.getJSON(localFile, function(data) {
			cm.addRow("SiteCatalog", data, nextStep);
		});
	});
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
		// console.log("found");
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
		console.log("not found");
		$.get(localFile, function(fileBody) {
			// alert("addrow")
			cm.addRow("ElementCatalog", {
				elementname : elementName,
				url : fileBody,
				url_file : remoteFileName,
				url_folder : remoteFileFolder
			}, nextStep);
		})
	});
}

// upload the asset with the remote post
function postAsset(action, data, nextStep) {

	// add the publication
	data.publication = $("#pub").val();

	// specify the action
	data.Action = action;

	// console.log(data);

	// delete the asset then post to the remote url entry point
	$.post(postUrl(), data, function(result) {
		// console.log(result)
		// msg(result)
		var m = /^Success:.*, ([0-9]+) saved\.$/.exec(result);
		if (m) {
			console.log(m[1]);
			// update element with the tid
			if ("rootelement" in data) {
				cm.editRow("ElementCatalog", {
					"elementname" : data.rootelement,
					"resdetails1" : //
					(data.AssetType == "Template" ? "tid=" : "eid=") + m[1]
				}, function() {
					nextStep(result, m[1]);
				});
			} else {
				nextStep(result, m[1]);
			}
		} else {
			nextStep(result)
		}
		// nextStep(result);
	})
}

function installAsset(type, name, nextStep) {
	jsonFile = type + "/" + name + ".json";
	var mytype = type;
	var myname = name;
	var oldNextStep = nextStep;
	$.getJSON(jsonFile, function(data) {
		if ("rootelement" in data)
			var where = "rootelement='" + data.rootelement + "'";
		else
			var where = "name='" + myname + "'";

		// handle attachments to assets
		var newNextStep = oldNextStep;
		if ("attach" in data) {
			var field = data.attach[0];
			var localFile = data.attach[1];
			var name = data.name;
			// console.log("found attaching " + field + " " + file);
			newNextStep = function(status, id) {
				console.log("loading " + field + "=" + localFile);
				$.get(mytype + "/" + localFile, function(fileBody) {
					// alert("addrow")
					var mydata = {};
					mydata[field] = fileBody;
					mydata[field + "_file"] = localFile;
					mydata[field + "_folder"] = type;
					mydata['id'] = id; // assuming that the id is propagated in
										// postAsset...
					console.log(oldNextStep);
					cm.editRow(type, mydata, function(status) {
						// console.log(status);
						oldNextStep(status.answer);
					});

				})
			};
			delete data['attach'];
		}

		cm.checkExist(type, where, // found?
		function(result) {
			// console.log("found");
			// propagate id collected when searched the asset
			data.id = result.id;
			postAsset("update", data, newNextStep);
		}, // not found?
		function(result) {
			// console.log("not found")
			$.getJSON(jsonFile, function(data) {
				postAsset("addrow", data, newNextStep)
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
		// console.log(":::"+match[1]+":"+match[2]);
		if (match && isChecked)
			installAsset(match[1], match[2], function(result) {
				console.log("status:" + result)
				out.html(result)
			})
		else
			out.html("...skipped")
	});
}

//assets installer
function installSamples() {
	$("table#sampleTable tr").each(function(node) {

		var cells = $(this).children();
		var isChecked = $(cells[0]).children("input").is(":checked");
		var match = /(.*):(.*)/.exec($(cells[1]).text());
		var out = $(cells[2]);
		// console.log(":::"+match[1]+":"+match[2]);
		if (match && isChecked)
			installAsset(match[1], match[2], function(result) {
				console.log("status:" + result)
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
				console.log("status2:" + status)
				out.html(status.result)
			})
		else
			out.html("...skipped")
	});

}

function installEntries() {
	installEntry("FatPhone", "FatPhone.json", function(status) {
		$('#installEntryResult').text(status.result)
	});
}

function toggleAll(where) {
	console.log($("table" + where).find(":checkbox"));
	$("table" + where).find(":checkbox").each(function(node) {
		// console.log(this);
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
		$("#installAssets").attr("disabled", false)
		$("#installEntries").attr("disabled", false)
		$("#installSamples").attr("disabled", false)
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
	$("#installEntries").click(installEntries);
	$("#installSamples").click(installSamples);
	
	$("#allElements").click(function() {
		toggleAll("#elementTable")
	});
	$("#allAssets").click(function() {
		toggleAll("#assetTable")
	});
	$("#allSamples").click(function() {
		toggleAll("#sampleTable")
	});
})
