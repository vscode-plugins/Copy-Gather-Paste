import * as vscode from 'vscode';

var gatheredBuffer: string[] = [];

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('copy-gather-paste.copy-gather',
                                                               copy_gather);
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand('copy-gather-paste.cut-gather',
                                                           cut_gather);
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand('copy-gather-paste.gather-paste',
                                                           gather_paste);
    context.subscriptions.push(disposable);
}

export function deactivate() { }

async function copy_gather(textEditor: vscode.TextEditor,
                           edit:       vscode.TextEditorEdit,
                           ...args:    any[]) {

    let selectedText = "";
    let selection    = textEditor.selection;
    if (selection.start.compareTo(selection.end) === 0) {
        selectedText = textEditor.document.lineAt(selection.start).text;
    }
    else {
        selectedText = textEditor.document.getText(selection);
    }

    if (selectedText.trim().length === 0) {
        return;
    }

    gatheredBuffer.push(selectedText);
}

async function cut_gather(textEditor: vscode.TextEditor,
    edit:       vscode.TextEditorEdit,
    ...args:    any[]) {
    let selectedText = "";
    let selection    = textEditor.selection;
    if (selection.start.compareTo(selection.end) === 0) {
        selectedText = textEditor.document.lineAt(selection.start).text;
        selection = new vscode.Selection(selection.start.line, 0, selection.start.line, selectedText.length);
    }
    else {
        selectedText = textEditor.document.getText(selection);
    }

    if (selectedText.trim().length === 0) {
        return;
    }

    textEditor.edit(builder => {
        builder.replace(selection, "");
    })
    .then(success => {

    });

    gatheredBuffer.push(selectedText);
}

async function gather_paste(textEditor: vscode.TextEditor,
                            edit:       vscode.TextEditorEdit,
                            ...args:    any[]) {
    if (gatheredBuffer.length === 0) {
        vscode.window.showInformationMessage("Copied/gathered buffer is empty");
        return;
    }
    
    const position = textEditor.selection.active;
    textEditor.edit(editBuilder => {
        for (var str of gatheredBuffer) {
            editBuilder.insert(position, str + "\n");
        }
    });

    gatheredBuffer = [];
}
