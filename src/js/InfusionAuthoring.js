
(function ($) {
    fluid.registerNamespace("fluid.authoring");
    
    fluid.defaults("fluid.authoring.editor", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "fluid.authoring.editor.postInit",
        finalInitFunction: "fluid.authoring.editor.finalInit"
    });
    
    fluid.authoring.editor.finalInit = function (that) {
        // Instantiate the Code Mirror editor instance.
        that.editor = CodeMirror.fromTextArea(that.container[0], {
            mode: "text/javascript",
            lineNumbers: true,
            onCursorActivity: that.highlightLine
        });
        
        // Highlight the first line of the editor.
        that.highlightLine(0);        
    };
    
    fluid.authoring.editor.postInit = function (that) {
        that.highlightLine = function (line) {
            var ed = that.editor;                
            ed.setLineClass(that.activeLine, null);
            that.activeLine = ed.setLineClass(ed.getCursor().line, "activeline");            
        };
    };
    
    
    fluid.defaults("fluid.authoring.environment", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "fluid.authoring.environment.postInit",
        finalInitFunction: "fluid.authoring.environment.finalInit",
        
        defaultEditor: "code",
        
        components: {
            codeEditor: {
                type: "fluid.authoring.editor",
                container: "{environment}.dom.code"
            },
            
            markupEditor: {
                type: "fluid.authoring.editor",
                container: "{environment}.dom.markup"
            },
            
            styleEditor: {
                type: "fluid.authoring.editor",
                container: "{environment}.dom.style"
            },
            
            editorTabs: {
                type: "fluid.tabs",
                container: "{environment}.dom.editorTabs"
            },
            
            injectionPanel: {
                type: "fluid.authoring.injectionPanel",
                container: "{environment}.dom.injectionPanel",
                options: {
                    environment: "{environment}" // TODO: evil
                }
            }
        },
        
        // TODO: Where should this go?
        editorTypes: {
            js: "codeEditor",
            html: "markupEditor",
            css: "styleEditor"
        },
        
        selectors: {
            editorTabs: ".flc-authoring-edit",
            code: ".flc-authoring-editor.code",
            markup: ".flc-authoring-editor.markup",
            style: ".flc-authoring-editor.style",
            preview: ".flc-authoring-preview"
        }
    });
    
    fluid.authoring.environment.postInit = function (that) {
        that.inject = function (editorType, snippet) {
            var editor = that[that.options.editorTypes[editorType]].editor;
            if (editor.somethingSelected()) {
                editor.replaceSelection(snippet);
            } else {
                editor.replaceRange(snippet, editor.getCursor());
            }
        };
        
        that.updatePreview = function () {
            that.locate("preview").html(that.markupEditor.editor.getValue());
        };
    };
    
    fluid.authoring.environment.finalInit = function (that) {
        // Keep the markup preview pane up to date with the editor.
        that.markupEditor.editor.setOption("onChange", that.updatePreview);
    };
    
    fluid.defaults("fluid.authoring.injectionPanel", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        postInitFunction: "fluid.authoring.injectionPanel.postInit",
        finalInitFunction: "fluid.authoring.injectionPanel.finalInit",
        
        components: {
            injectionTabs: {
                type: "fluid.tabs",
                container: "{injectionPanel}.dom.tabs"
            }
        },
        
        protoTree: {
            namespaceField: "${namespace.name}"
        },
        
        model: {
            namespace: {
                name: "me"
            }
        },
        
        selectors: {
            closureButton: ".flc-authoring-inject-closure",
            uiOptionsButton: ".flc-authoring-inject-uio",
            namespaceField: ".flc-authoring-inject-namespace-name",
            namespaceButton: ".flc-authoring-inject-namespace",
            tabs: ".flc-authoring-injectPanel-tabs"
        }
    });
    
    fluid.authoring.injectionPanel.postInit = function (that) {
        that.inject = function (type) {
            var injectionSpec = fluid.authoring.injectors[type],
                modelVals = that.model[type],
                snippet = fluid.stringTemplate(injectionSpec.template, modelVals);
            
            that.options.environment.inject(injectionSpec.type, snippet);
        };
    };
    
    fluid.authoring.injectionPanel.finalInit = function (that) {
        // Bind each button to its injector.
        // TODO: This is a brittle association between selector names in the component and injector names
        // Should be refactored so that each button/injector pair is represented by a component, a bit like an "ant."
        fluid.each(that.options.selectors, function (selector, selectorName) {
            var buttonIdx = selectorName.indexOf("Button");
            if (buttonIdx != -1) {
                that.locate(selectorName).click(function (e) {
                    var injectorName = selectorName.substring(0, buttonIdx);
                    that.inject(injectorName);
                    return false;
                })
            }
        });
    };
    
    fluid.authoring.injectors = {
        "closure": {
            type: "js",
            template: "(function ($) {\n\n})(jQuery);"
        },
        "namespace": {
            type: "js",
            template: "    fluid.registerNamespace(\"%name\");"
        },
        "component": {
            type: "js",
            template: "    fluid.defaults(\"%componentName\", %defaults);\n\n %componentName.finalInit = function (that) {\n\n};"
        },
        "uiOptions": {
            type: "html",
            template: "<link rel=\"stylesheet\" type=\"text/css\" href=\"framework/fss/css/fss-layout.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"framework/fss/css/fss-text.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"components/uiOptions/css/fss/fss-theme-bw-uio.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"components/uiOptions/css/fss/fss-theme-wb-uio.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"components/uiOptions/css/fss/fss-theme-by-uio.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"components/uiOptions/css/fss/fss-theme-yb-uio.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"components/uiOptions/css/fss/fss-text-uio.css\" />" + 
                "\n\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"lib/jquery/ui/css/fl-theme-hc/hc.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"lib/jquery/ui/css/fl-theme-hci/hci.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"lib/jquery/ui/css/fl-theme-blackYellow/blackYellow.css\" />" + "\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"lib/jquery/ui/css/fl-theme-yellowBlack/yellowBlack.css\" />" + 
                "\n\n" +
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"components/uiOptions/css/FatPanelUIOptions.css\" />" + 
                "\n\n" +
                "<!-- The Infusion Library -->" + "\n" + 
                "<script type=\"text/javascript\" src=\"InfusionAll.js\"></script>" + 
                "\n\n" +
                "<div class=\"flc-uiOptions-fatPanel fl-uiOptions-fatPanel\">" + "\n" + 
                "    <!-- This is the div that will contain the UI Options component -->" + "\n" + 
            	"    <div id=\"myUIOptions\" class=\"flc-slidingPanel-panel flc-uiOptions-iframe\"></div>" + "\n\n" +     

                "    <!-- This div is for the sliding panel that shows and hides the UI Options controls -->" + "\n" +
            	"    <div class=\"fl-panelBar\">" + "\n" +
            	"        <button class=\"flc-slidingPanel-toggleButton fl-toggleButton\">Display Preferences</button>" + "\n" +
            	"    </div>" + "\n" +
                "</div>" + "\n\n" + 
                "<script type=\"text/javascript\">" + "\n" +
                "    // Instantiate the UI Enhancer component, specifying the table of contents' template URL" + "\n" +
                "    fluid.pageEnhancer({" + "\n" +
                "        tocTemplate: \"../../lib/infusion/components/tableOfContents/html/TableOfContents.html\"" + "\n" +
                "    });" + "\n" +
                "    // Start up UI Options" + "\n" +
                "    fluid.uiOptions.fatPanel(\".flc-uiOptions-fatPanel\", {" + "\n" +
                "        prefix: \"../../lib/infusion/components/uiOptions/html/\"" + "\n" +
                "    });" + "\n" +
                "</script>"
        }
    };
        
})(jQuery);
