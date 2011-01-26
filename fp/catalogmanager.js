$.ajaxSetup({
	// Disable caching of AJAX responses
	cache : false
});

// update url
function addRowAnswer(result) {

	if (result.indexOf("FTCS|||result=success") == -1)
		msg("ERROR: Cannot upload file");
	else
		msg("Element uploaded.")
}

// login using CatalogManager
function deleteRow(table, key, value, nextStep) {
	$.get(this.url, {
		'ftcmd' : 'deleterow',
		'tablename' : table,
		'tablekey' : key,
		'tablekeyvalue' : value
	}, nextStep)
}
/**
 * 
 * @param url
 * @returns {CatalogManager}
 */
function CatalogManager(url) {
	this.url = url + "CatalogManager"

	/**
	 * Parse results
	 */
	function parseStatus(body) {

		console.log("parseStatusPre");
		var m = /<!--FTCS\|\|\|result=(.*?)\|\|\|reason=(.*?)\|\|\|err=(-?\d+)\|\|\|command=(.*?)\|\|\|params=(.*?)\|\|\|-->/
				.exec(body);
		console.log(m);

		if (m)
			return {
				"ok" : m[1] == "success",
				"parsed" : true,
				"answer" : body,
				"result" : m[1],
				"reason" : m[2],
				"err" : m[3],
				"command" : m[4],
				"params" : m[5]

			}
		else
			return {
				"ok" : false,
				"parsed" : false,
				"answer" : body
			};
	}
	
	/**
	 * Login
	 */
	this.login = function(username, password, found, notFound) {
		console.log("login");
		$.get(this.url, {
			'ftcmd' : 'login',
			'username' : username,
			'password' : password
		}, function(result) {
			console.log(result);
			var status = parseStatus(result);
			console.log(status);
			if (status.ok)
				found(status);
			else
				notFound(status);
		});
	}

	/**
	 * Syncronous flush function
	 */
	this.flush = function(tablename) {
		$.ajax({
			async : false, // do nothing until logged on
			type : "GET",
			url : this.url,
			dataType : 'html',
			data : {
				'ftcmd' : 'login',
				'username' : username,
				'password' : password
			},
			cache : false
		});
	}

	/**
	 * Select row
	 */
	this.selectRow = function(tablename, selwhere, selwhat, nextStep) {
		console.log("selectrow");
		$.get(this.url, {
			'ftcmd' : 'selectrow(s)',
			'tablename' : tablename,
			'selwhere' : selwhere,
			'selwhat' : selwhat
		}, function(answer) {
			nextStep(parseStatus(answer));
		});
	}

	/**
	 * Check if a row in the given table exists
	 */
	this.checkExist = function(tablename, selwhere, found, notFound) {
		this.selectRow(tablename, selwhere, '*', function(status) {
			if (status.ok)
				found(status);
			else
				notFound(status);
		});
	}

	/**
	 * Generic Catalog Manager command interface
	 */
	this.catalogManager = function(ftcmd, tablename, data, nextStep) {
		var data1 = data;
		data1.ftcmd = ftcmd;
		data1.tablename = tablename;
		data1._charset_ = 'UTF-8';
		$.post(this.url, data1, function(answer) {
			var status = parseStatus(answer);
			nextStep(status);
		});
	}

	this.addRow = function(tablename, data, nextStep) {
		this.catalogManager("addrow", tablename, data, nextStep);
	}

	this.editRow = function(tablename, data, nextStep) {
		this.catalogManager("editrow", tablename, data, nextStep);
	}

	this.deleteRow = function(tablename, data, nextStep) {
		this.catalogManager("deleterow", tablename, data, nextStep);
	}
}
