dojo.require("esri.map");
dojo.require("esri.toolbars.draw");
dojo.require("esri.graphic");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("esri.symbols.SimpleLineSymbol");
dojo.require("esri.symbols.SimpleFillSymbol");
dojo.require("esri.geometry.ScreenPoint")
dojo.require("dojo._base.connect");
dojo.require("dijit.focus");

dojo.ready(function()
{
    new Vue(
    {
        el: "#app",
        data:
        {
            map: null,
            drawMode: false,
            drawHandle: null,
            accessibilityMode: false
        },
        watch:
        {
            drawMode: function()
            {
                this.drawMode ? this.startDrawing() : this.endDrawing();
            },

            accessibilityMode: function()
            {
                if(this.drawMode && !this.accessibilityMode)
                    this.endDrawing();
            }
        },
        mounted: function()
        {
            this.init();
        },
        methods:
        {
            init: function()
            {
                this.map = new esri.Map("map", { basemap: "dark-gray-vector", center: [-5.930154, 54.596745], zoom: 13 });
                window.map = this.map;
                this.map.on("load", () =>
                {
                    this.map.disableKeyboardNavigation();
                    $(window).on("keydown", e => this.map.navigationManager._keyDown(e));
                    $(window).on("keyup", e => this.map.navigationManager._keyEnd(e));
                    this.drawHandle = new esri.toolbars.Draw(this.map);
                });
                
                let clickEvent = this.map.on("click", e =>
                {
                    clickEvent.remove();
                    window.mapPointCustom = e;
                });
            },

            startDrawing: function()
            {
                if(this.drawHandle != null)
                {
                    this.drawHandle.activate(esri.toolbars.Draw["POLYGON"]);
                    this.drawHandle.drawStartHandle = this.drawHandle.on("draw-start", e =>
                    {
                        if(this.accessibilityMode)
                        {
                            if(this.drawHandle._onMouseMoveHandler_connect != null)
                                this.drawHandle._onMouseMoveHandler_connect.remove();
                            if(this.drawHandle._onClickHandler_connect != null)
                                this.drawHandle._onClickHandler_connect.remove();
                            if(this.drawHandle._onDblClickHandler_connect != null)
                                this.drawHandle._onDblClickHandler_connect.remove();
                        }
                    });
                    this.drawHandle.drawCompleteHandle = this.drawHandle.on("draw-complete", e =>
                    {
                        let symbol = new esri.symbol.SimpleFillSymbol();
                        let g = new esri.Graphic(e.geometry, symbol);
                        this.map.graphics.add(g);
                    });
 
                    this.drawHandle.keyUpHandle = $(window).on("keyup", e =>
                    {
                        if(this.accessibilityMode)
                        {
                            let screenPoint = new esri.geometry.ScreenPoint($("#map").width() / 2, $("#map").height() / 2);
                            let mouseEventArg = { mapPoint: this.map.toMap(screenPoint) };
                        
                            if(this.drawHandle._graphic != null)
                                this.drawHandle._onMouseMoveHandler(mouseEventArg);

                            if(e.keyCode === 69)
                            {
                                this.drawHandle._onClickHandler(mouseEventArg);
                            }
                            else if(e.keyCode === 70)
                            {
                                this.drawHandle._onClickHandler(mouseEventArg);
                                this.drawHandle._onDblClickHandler(mouseEventArg);
                            }
                        }
                    });
                }
            },

            endDrawing: function()
            {
                if(this.drawHandle != null)
                {
                    this.drawHandle.deactivate();
                    this.drawHandle.keyUpHandle.remove();
                    this.drawHandle.drawStartHandle.remove();
                    this.drawHandle.drawCompleteHandle.remove();

                    if(this.drawMode)
                        this.drawMode = false;
                }
            },

            simulateClick: function (c) 
            {
                var a = c.mapPoint;
                c = this.drawHandle.map;
                var b = c.toScreen(a),
                d = esri.toolbars.Draw;
                if (this.drawHandle._isPointToPointTool(this.drawHandle._geometryType)) {
                    var f = this.drawHandle._points[this.drawHandle._points.length - 1];
                    if (a && f && a.x === f.x && a.y === f.y) return;
                    this.drawHandle._points.push(a.offset(0, 0))
                }
                switch (this.drawHandle._geometryType)
                {
                    case d.POLYGON:
                        if(this.drawHandle._points.length === 1)
                        {
                            a = new q(c.spatialReference);
                            a.addRing(this.drawHandle._points);
                            this.drawHandle._graphic = c.graphics.add(new v(a, this.drawHandle.fillSymbol), !0);
                            this.drawHandle.onDrawStart();
                        }
                        else
                        {
                            this.drawHandle._graphic.geometry._insertPoints([a.offset(0, 0)], 0);
                            this.drawHandle._graphic.setGeometry(this.drawHandle._graphic.geometry).setSymbol(this.drawHandle.fillSymbol);
                        }
                        break;
                }
                this.drawHandle._setTooltipMessage(this.drawHandle._points.length);
            }
        }
    });
});