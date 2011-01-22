<%@ taglib prefix="cs" uri="futuretense_cs/ftcs1_0.tld"%><%@ taglib
	prefix="asset" uri="futuretense_cs/asset.tld"%><%@ taglib
	prefix="assetset" uri="futuretense_cs/assetset.tld"%><%@ taglib
	prefix="commercecontext" uri="futuretense_cs/commercecontext.tld"%><%@ taglib
	prefix="ics" uri="futuretense_cs/ics.tld"%><%@ taglib
	prefix="listobject" uri="futuretense_cs/listobject.tld"%><%@ taglib
	prefix="render" uri="futuretense_cs/render.tld"%><%@ taglib
	prefix="siteplan" uri="futuretense_cs/siteplan.tld"%><%@ taglib
	prefix="searchstate" uri="futuretense_cs/searchstate.tld"%><%@ page
	import="COM.FutureTense.Interfaces.*,
                   COM.FutureTense.Util.ftMessage,
                   COM.FutureTense.Util.ftErrors"%><cs:ftcs>
	<%-- /fpLayout

INPUT

OUTPUT

Salve!

--%>
	<%-- Record dependencies for the Template --%>
	<ics:if condition='<%=ics.GetVar("tid")!=null%>'>
		<ics:then>
			<render:logdep cid='<%=ics.GetVar("tid")%>' c="Template" />
		</ics:then>
	</ics:if>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
	<meta content="yes" name="apple-mobile-web-app-capable" />
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
	<meta
		content="minimum-scale=1.0, width=device-width, maximum-scale=0.6667, user-scalable=no"
		name="viewport" />
	<link href="/fp/css/style.css" rel="stylesheet" media="screen"
		type="text/css" />
	<script src="/fp/javascript/functions.js" type="text/javascript"></script>
	<title>FatPhone</title>
	<%-- 
	<meta content="keyword1,keyword2,keyword3" name="keywords" />
	<meta content="Description of your page" name="description" />
	--%>
	</head>

	<body>

	<div id="topbar"></div>
	<div id="content">XXX</div>
	<div id="footer"><!-- Support iWebKit by sending us traffic; please keep this footer on your page, consider it a thank you for our work :-) -->
	Powered by <a class="noeffect" href="http://iwebkit.net">iWebKit</a>
	&amp; <a class="noeffect"
		href="http://www.sciabarra.com/fatwire/fatphone">FatPhone</a></div>

	</body>

	</html>


</cs:ftcs>