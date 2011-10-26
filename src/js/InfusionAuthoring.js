
(function ($) {
    fluid.registerNamespace("fluid.authoring");
    
    fluid.defaults("fluid.authoring.codeEditor", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        postInitFunction: "fluid.authoring.codeEditor.postInit",
        finalInitFunction: "fluid.authoring.codeEditor.finalInit",
        selectors: {
            code: ".flc-authoring-code-editor",
            closureButton: ".flc-authoring-closure"
        }
    });
    
    fluid.authoring.codeEditor.postInit = function (that) {
        that.inject = function (type, options) {
            var snippet = fluid.stringTemplate(fluid.authoring.injectors[type], options);
            that.editor.replaceRange(snippet, that.editor.getCursor());
        };
        
        that.highlightLine = function (line) {
            var ed = that.editor;                
            ed.setLineClass(that.activeLine, null);
            that.activeLine = ed.setLineClass(ed.getCursor().line, "activeline");            
        };
    };
    
    fluid.authoring.codeEditor.finalInit = function (that) {
        // Instantiate the Code Mirror editor instance.
        that.editor = CodeMirror.fromTextArea(that.locate("code")[0], {
            mode: "text/javascript",
            lineNumbers: true,
            onCursorActivity: that.highlightLine
        });
        
        // Highlight the first line of the editor.
        that.highlightLine(0);
        
        // Bind the editor buttons.
        that.locate("closureButton").click(function (e) {
            that.inject("closure");
            return false;
        });
        
    };
    
    fluid.authoring.injectors = {
        "closure": "(function ($) {\n\n})(jQuery);",
        "namespace": "    fluid.registerNamespace(\"%namespace\");",
        "component": "    fluid.defaults(\"%componentName\", %defaults);\n\n %componentName.finalInit = function (that) {\n\n};"
    };
        
})(jQuery);
