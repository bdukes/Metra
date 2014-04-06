<%@ Control language="c#" AutoEventWireup="false" Explicit="True" Inherits="DotNetNuke.UI.Skins.Skin" %>
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.Client.ClientResourceManagement" Assembly="DotNetNuke.Web.Client" %>
<%@ Register TagPrefix="dnn" TagName="Meta" Src="~/Admin/Skins/Meta.ascx" %>
<%@ Register TagPrefix="ddr" TagName="MENU" src="~/DesktopModules/DDRMenu/Menu.ascx" %>
<%@ Register TagPrefix="ddr" Namespace="DotNetNuke.Web.DDRMenu.TemplateEngine" Assembly="DotNetNuke.Web.DDRMenu" %>
<%@ Register TagPrefix="dnn" TagName="Copyright" Src="~/Admin/Skins/copyright.ascx" %>

<dnn:Meta runat="server" name="viewport" content="width=device-width, initial-scale=1.0" />
<dnn:Meta runat="server" http-equiv="X-UA-Compatible" content="IE=edge" />

<dnn:DnnCssInclude runat="server" FilePath="//fonts.googleapis.com/css?family=Coustard:400,900"/>
<dnn:DnnCssInclude runat="server" FilePath="less/theme.css" PathNameAlias="SkinPath" />
<dnn:DnnJsInclude runat="server" FilePath="js/bootstrap.js" PathNameAlias="SkinPath" ForceProvider="DnnFormBottomProvider" />
<dnn:DnnJsInclude runat="server" FilePath="js/html5shiv.js" PathNameAlias="SkinPath" ForceProvider="DnnPageHeaderProvider" />
<dnn:DnnJsInclude runat="server" FilePath="js/respond.min.js" PathNameAlias="SkinPath" ForceProvider="DnnFormBottomProvider" />

<div id="MetraMitchell" class="metra container">	
    <header id="header" class="header">  
        <div class="header-wrap row">
            <h1 class="logo col-md-3">Metra Mitchell</h1>
            <nav class="navbar navbar-default col-md-9" role="navigation">
                <ddr:MENU MenuStyle="BootstrapNav3-Swipe" runat="server" />
            </nav> 
        </div>     
    </header>
    <main role="main" class="main-body">       
        <div id="ContentPane" class="contentpane row" runat="server"></div>
	</main>
	<footer id="footer" class="footer row">
        <div class="copyright col-md-12"><dnn:Copyright runat="server" id="Copyright1" /></div>
	</footer>
</div>
<script runat="server">
    protected override void OnInit(EventArgs e)
    {
        base.OnInit(e);
        DotNetNuke.Framework.jQuery.RequestRegistration();
    }
</script>