
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
            preview: ".flc-authoring-preview",
            closureButton: ".flc-authoring-closure"
        }
    });
    
    fluid.authoring.environment.postInit = function (that) {
        that.inject = function (type, options) {
            var injectionSpec = fluid.authoring.injectors[type],
                snippet = fluid.stringTemplate(injectionSpec.template, options),
                editor = that[that.options.editorTypes[injectionSpec.type]].editor;
            
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
        // Bind the editor buttons.
        that.locate("closureButton").click(function (e) {
            that.inject("closure");
            return false;
        });
        
        // Keep the markup preview pane up to date with the editor.
        that.markupEditor.editor.setOption("onChange", that.updatePreview);
    };
    
    fluid.authoring.injectors = {
        "closure": {
            type: "js",
            template: "(function ($) {\n\n})(jQuery);"
        },
        "namespace": {
            type: "js",
            template: "    fluid.registerNamespace(\"%namespace\");"
        },
        "component": {
            type: "js",
            template: "    fluid.defaults(\"%componentName\", %defaults);\n\n %componentName.finalInit = function (that) {\n\n};"
        }
    };
        
})(jQuery);
